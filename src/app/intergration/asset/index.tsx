'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Input, Button, Tree, Cascader, Modal, message } from 'antd';
import useApiClient from '@/utils/request';
import assetStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import { ColumnItem, TreeItem, ModalRef, Organization } from '@/types';
import { ObectItem, RuleInfo, ObjectInstItem } from '@/types/monitor';
import { deepClone } from '@/utils/common';
import CustomTable from '@/components/custom-table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Icon from '@/components/icon';
import RuleModal from './ruleModal';
const { Search } = Input;
import { useCommon } from '@/context/common';
const { confirm } = Modal;

const Asset = () => {
  const { get, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const ruleRef = useRef<ModalRef>(null);
  const [pagination, setPagination] = useState<any>({
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
  const [tableData, setTableData] = useState<any[]>([]);

  const columns: ColumnItem[] = [
    {
      title: t('common.name'),
      dataIndex: 'instance_id',
      key: 'instance_id',
    },
    {
      title: t('monitor.collectionNode'),
      dataIndex: 'agent_id',
      key: 'agent_id',
    },
    {
      title: t('common.group'),
      dataIndex: 'organization',
      key: 'organization',
      render: (_, { organization }) => (
        <>{organization?.length ? organization.join(',') : '--'}</>
      ),
    },
    {
      title: t('common.time'),
      dataIndex: 'time',
      key: 'time',
      render: (_, { time }) => <>{time || '--'}</>,
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
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  const openRuleModal = (type: string, row = {}) => {
    const title = t(type === 'add' ? 'monitor.addRule' : 'monitor.editRule');
    ruleRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const checkDetail = (row: ObjectInstItem) => {
    console.log(row);
  };

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  const getAssetInsts = async (objectId: React.Key) => {
    try {
      setTableLoading(true);
      const data = await get(
        `/api/monitor_instance_group_rule/monitor_object_instances/${objectId}/`,
        {
          params: {
            name: '',
          },
        }
      );
      setTableData(data);
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
      setRuleList(data);
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
        },
      });
      const _treeData = getTreeData(data);
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
          title: item.type,
          key: item.type,
          children: [],
        };
      }
      acc[item.type].children.push({
        title: item.name,
        key: item.id,
        children: [],
      });
      return acc;
    }, {} as Record<string, TreeItem>);
    return Object.values(groupedData);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const isFirstLevel = !!info.node?.children?.length;
    if (!isFirstLevel) {
      setSelectedKeys(selectedKeys);
      getAssetInsts(selectedKeys[0]);
      getRuleList(selectedKeys[0]);
    }
  };

  const onSearchTree = (value: any) => {
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
              <Cascader
                className="mr-[8px]"
                showSearch
                options={organizationList}
              />
              <Input
                className="w-[320px]"
                placeholder={t('common.searchPlaceHolder')}
              ></Input>
            </div>
            <CustomTable
              scroll={{ y: 'calc(100vh - 320px)', x: 'calc(100vw - 500px)' }}
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
            <div>Rule</div>
            <ul className={assetStyle.ruleList}>
              <li
                className={`${assetStyle.ruleItem} ${assetStyle.add}`}
                onClick={() => openRuleModal('add')}
              >
                <PlusOutlined />
              </li>
              {ruleList.map((item) => (
                <li key={item.id} className={assetStyle.ruleItem}>
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
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openRuleModal('edit', item)}
                      />
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteConfirm(item)}
                      />
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
