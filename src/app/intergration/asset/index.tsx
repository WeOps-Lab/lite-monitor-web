'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Spin,
  Input,
  Button,
  Tree,
  Modal,
  message,
  Tooltip,
  Dropdown,
} from 'antd';
import useApiClient from '@/utils/request';
import assetStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import {
  ColumnItem,
  TreeItem,
  ModalRef,
  Organization,
  Pagination,
  TableDataItem,
} from '@/types';
import { ObectItem, RuleInfo, ObjectInstItem } from '@/types/monitor';
import CustomTable from '@/components/custom-table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Icon from '@/components/icon';
import RuleModal from './ruleModal';
const { Search } = Input;
import { useCommon } from '@/context/common';
import { deepClone, showGroupName } from '@/utils/common';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import CustomCascader from '@/components/custom-cascader';
const { confirm } = Modal;

const Asset = () => {
  const { get, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const commonContext = useCommon();
  const { convertToLocalizedTime } = useLocalizedTime();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const ruleRef = useRef<ModalRef>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [ruleLoading, setRuleLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [ruleList, setRuleList] = useState<RuleInfo[]>([]);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );
  const [objects, setObjects] = useState<ObectItem[]>([]);

  const columns: ColumnItem[] = [
    {
      title: t('common.name'),
      dataIndex: 'instance_name',
      key: 'instance_name',
    },
    {
      title: t('common.group'),
      dataIndex: 'organization',
      key: 'organization',
      render: (_, { organization }) => (
        <>{showGroupName(organization, organizationList)}</>
      ),
    },
    {
      title: t('common.time'),
      dataIndex: 'time',
      key: 'time',
      render: (_, { time }) => (
        <>{time ? convertToLocalizedTime(new Date(time * 1000) + '') : '--'}</>
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => checkDetail(record)}>
            {t('common.detail')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!isLoading) {
      getObjects();
    }
  }, [isLoading]);

  useEffect(() => {
    if (selectedKeys.length) {
      getAssetInsts(selectedKeys[0]);
    }
  }, [pagination.current, pagination.pageSize, selectedOrganizations]);

  const openRuleModal = (type: string, row = {}) => {
    const title: string = t(
      type === 'add'
        ? 'monitor.intergrations.addRule'
        : 'monitor.intergrations.editRule'
    );
    ruleRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const checkDetail = (row: ObjectInstItem) => {
    const _row = deepClone(row);
    const _objId = selectedKeys[0];
    _row.monitorObjId = _objId;
    _row.name = objects.find((item) => item.id === _objId)?.name || '';
    const queryString = new URLSearchParams(_row).toString();
    const url = `/view/detail/overview?${queryString}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const getAssetInsts = async (objectId: React.Key, type?: string) => {
    try {
      setTableLoading(true);
      const data = await get(`/api/monitor_instance/${objectId}/list/`, {
        params: {
          page: pagination.current,
          page_size: pagination.pageSize,
          name: type === 'clear' ? '' : searchText,
          organizations: selectedOrganizations.join(','),
        },
      });
      setTableData(data?.results || []);
      setPagination((prev: Pagination) => ({
        ...prev,
        total: data?.count || 0,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const getRuleList = async (objectId: React.Key) => {
    try {
      setRuleLoading(true);
      const data = await get(`/api/monitor_instance_group_rule/`, {
        params: {
          monitor_object_id: objectId,
        },
      });
      setRuleList(data || []);
    } finally {
      setRuleLoading(false);
    }
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      const data = await get(`/api/monitor_object/`, {
        params: {
          name: text || '',
          add_instance_count: true,
        },
      });
      setObjects(data);
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setExpandedKeys(_treeData.map((item) => item.key));
      const defaultChildren = _treeData[0]?.children;
      if (defaultChildren?.length) {
        const key = defaultChildren[0].key;
        setSelectedKeys([key]);
        getAssetInsts(key);
        getRuleList(key);
      }
    } finally {
      setPageLoading(false);
    }
  };

  const getTreeData = (data: ObectItem[]): TreeItem[] => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {
          title: item.display_type || '--',
          key: item.type,
          children: [],
        };
      }
      acc[item.type].children.push({
        title: `${item.display_name || '--'}(${item.instance_count ?? 0})`,
        key: item.id,
        children: [],
      });
      return acc;
    }, {} as Record<string, TreeItem>);
    return Object.values(groupedData);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const isFirstLevel = !!info.node?.children?.length;
    if (!isFirstLevel && selectedKeys?.length) {
      setPagination((prev: Pagination) => ({
        ...prev,
        current: 1,
      }));
      setTableData([]);
      setSelectedKeys(selectedKeys);
      getAssetInsts(selectedKeys[0]);
      getRuleList(selectedKeys[0]);
    }
  };

  const onSearchTree = (value: string) => {
    getObjects(value);
  };

  const operateRule = () => {
    getRuleList(selectedKeys[0]);
  };

  const showDeleteConfirm = (row: RuleInfo) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/monitor_instance_group_rule/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getRuleList(selectedKeys[0]);
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts(selectedKeys[0], 'clear');
  };

  return (
    <Spin spinning={pageLoading}>
      <div className={assetStyle.asset}>
        <div className={assetStyle.tree}>
          <Search
            className="mb-[10px]"
            placeholder={t('common.searchPlaceHolder')}
            onSearch={onSearchTree}
          />
          <Tree
            className={assetStyle.tree}
            showLine
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
            onSelect={onSelect}
            treeData={treeData}
          />
        </div>
        <Spin spinning={pageLoading}>
          <div className={assetStyle.table}>
            <div className={assetStyle.search}>
              <CustomCascader
                className="mr-[8px] w-[250px]"
                showSearch
                maxTagCount="responsive"
                options={organizationList}
                onChange={(value) =>
                  setSelectedOrganizations(value as string[])
                }
                multiple
                allowClear
              />
              <Input
                allowClear
                className="w-[320px]"
                placeholder={t('common.searchPlaceHolder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => getAssetInsts(selectedKeys[0])}
                onClear={clearText}
              ></Input>
            </div>
            <CustomTable
              scroll={{ y: 'calc(100vh - 320px)' }}
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={tableLoading}
              rowKey="instance_id"
              onChange={handleTableChange}
            ></CustomTable>
          </div>
        </Spin>
        <Spin spinning={ruleLoading}>
          <div className={assetStyle.rule}>
            <div className={`${assetStyle.ruleTips} relative`}>
              {t('monitor.intergrations.rule')}
              <Tooltip
                placement="top"
                title={t('monitor.intergrations.ruleTips')}
              >
                <div
                  className="absolute cursor-pointer"
                  style={{
                    top: '-3px',
                    right: '4px',
                  }}
                >
                  <Icon
                    type="a-shuoming2"
                    className="text-[14px] text-[var(--color-text-3)]"
                  />
                </div>
              </Tooltip>
            </div>
            <ul className={assetStyle.ruleList}>
              <li
                className={`${assetStyle.ruleItem} ${assetStyle.add} shadow-sm rounded-sm`}
                onClick={() => openRuleModal('add')}
              >
                <PlusOutlined />
              </li>
              {ruleList.map((item) => (
                <li
                  key={item.id}
                  className={`${assetStyle.ruleItem} shadow-sm rounded-sm`}
                >
                  <div className={assetStyle.editItem}>
                    <Icon
                      className={assetStyle.icon}
                      type={
                        item.type === 'condition'
                          ? 'shaixuantiaojian'
                          : 'xuanze'
                      }
                    />
                    <span>{item.name}</span>
                    <div className={assetStyle.operate}>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'edit',
                              label: (
                                <a
                                  className="text-[12px]"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => openRuleModal('edit', item)}
                                >
                                  {t('common.edit')}
                                </a>
                              ),
                            },
                            {
                              key: 'delete',
                              label: (
                                <a
                                  className="text-[12px]"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => showDeleteConfirm(item)}
                                >
                                  {t('common.delete')}
                                </a>
                              ),
                            },
                          ],
                        }}
                      >
                        <div>
                          <Icon
                            className={assetStyle.moreIcon}
                            type="sangedian-copy"
                          />
                        </div>
                      </Dropdown>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Spin>
        <RuleModal
          ref={ruleRef}
          monitorObject={selectedKeys[0]}
          groupList={organizationList}
          onSuccess={operateRule}
        />
      </div>
    </Spin>
  );
};

export default Asset;
