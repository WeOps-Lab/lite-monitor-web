'use client';
'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Spin,
  Input,
  Button,
  Tree,
  Cascader,
  Modal,
  message,
  Switch,
} from 'antd';
import useApiClient from '@/utils/request';
import assetStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import { ColumnItem, TreeItem, Organization, Pagination } from '@/types';
import {
  ObectItem,
  RuleInfo,
  AlertProps,
  TableDataItem,
} from '@/types/monitor';
import CustomTable from '@/components/custom-table';
const { Search } = Input;
import { useCommon } from '@/context/common';
import {
  deepClone,
  showGroupName,
  getRandomColor,
  findLabelById,
} from '@/utils/common';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
const { confirm } = Modal;

const Strategy: React.FC<AlertProps> = ({ objects }) => {
  const { t } = useTranslation();
  const { get, del, isLoading } = useApiClient();
  const commonContext = useCommon();
  const { convertToLocalizedTime } = useLocalizedTime();
  const router = useRouter();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );

  const columns: ColumnItem[] = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.group'),
      dataIndex: 'organizations',
      key: 'organizations',
      render: (_, { organizations }) => (
        <>{showGroupName(organizations, organizationList)}</>
      ),
    },
    {
      title: t('common.creator'),
      dataIndex: 'created_by',
      key: 'created_by',
      render: (_, { created_by }) => {
        return created_by ? (
          <div className="column-user" title={created_by}>
            <span
              className="user-avatar"
              style={{ background: getRandomColor() }}
            >
              {created_by.slice(0, 1).toLocaleUpperCase()}
            </span>
            <span className="user-name">{created_by}</span>
          </div>
        ) : (
          <>--</>
        );
      },
    },
    {
      title: t('common.createTime'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (_, { created_at }) => (
        <>{created_at ? convertToLocalizedTime(created_at) : '--'}</>
      ),
    },
    {
      title: t('monitor.executionTime'),
      dataIndex: 'time',
      key: 'time',
      render: (_, { time }) => (
        <>{time ? convertToLocalizedTime(new Date(time * 1000) + '') : '--'}</>
      ),
    },
    {
      title: t('monitor.effective'),
      dataIndex: 'effective',
      key: 'effective',
      render: (_, record) => (
        <Switch
          size="small"
          onChange={handleEffectiveChange}
          value={record.effective}
        />
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showDeleteConfirm(record)}>
            {t('common.delete')}
          </Button>
          <Button
            className="ml-[10px]"
            type="link"
            onClick={() => linkToStrategyDetail('edit', record)}
          >
            {t('common.edit')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (objects?.length) {
      getObjects();
    }
  }, [objects]);

  useEffect(() => {
    if (selectedKeys[0]) {
      getAssetInsts(selectedKeys[0]);
    }
  }, [
    selectedOrganizations,
    pagination.current,
    pagination.pageSize,
    selectedKeys,
  ]);

  const getParams = (text?: string) => {
    return {
      name: text ? '' : searchText,
      page: pagination.current,
      page_size: pagination.pageSize,
      organizations: selectedOrganizations.join(','),
      monitor_object_id: selectedKeys[0] || '',
    };
  };

  const handleEffectiveChange = () => {
    console.log(123);
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const getAssetInsts = async (objectId: React.Key, text?: string) => {
    try {
      setTableLoading(true);
      const params = getParams(text);
      params.monitor_object_id = objectId;
      const data = await get(`/api//monitor_policy/`, {
        params,
      });
      setTableData(data.items || []);
      setPagination((pre) => ({
        ...pre,
        total: data.count,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      let data: ObectItem[] = objects;
      if (text) {
        data = await get(`/api/monitor_object/`, {
          params: {
            name: text || '',
          },
        });
      }
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setExpandedKeys(_treeData.map((item) => item.key));
      const defaultChildren = _treeData[0]?.children;
      if (defaultChildren?.length) {
        const key = defaultChildren[0].key;
        setSelectedKeys([key]);
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
    if (!isFirstLevel && selectedKeys?.length) {
      setPagination((prev: Pagination) => ({
        ...prev,
        current: 1,
      }));
      setSelectedKeys(selectedKeys);
    }
  };

  const onSearchTree = (value: string) => {
    getObjects(value);
  };

  const showDeleteConfirm = (row: RuleInfo) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/monitor_policy/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getAssetInsts(selectedKeys[0]);
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const enterText = () => {
    getAssetInsts(selectedKeys[0]);
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts(selectedKeys[0], 'clear');
  };

  const linkToStrategyDetail = (type: string, row = { id: '', name: '' }) => {
    const monitorObjId = selectedKeys[0] as string;
    const monitorName = findLabelById(treeData, monitorObjId) as string;
    const params = new URLSearchParams({
      monitorObjId,
      monitorName,
      type,
      id: row.id,
      name: row.name,
    });
    const targetUrl = `/event/strategy?${params.toString()}`;
    router.push(targetUrl);
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
        <div className={assetStyle.table}>
          <div className={assetStyle.search}>
            <div>
              <Cascader
                className="mr-[8px]"
                showSearch
                options={organizationList}
                onChange={(value) => setSelectedOrganizations(value as any)}
                multiple
                allowClear
              />
              <Input
                className="w-[320px]"
                placeholder={t('common.searchPlaceHolder')}
                allowClear
                onPressEnter={enterText}
                onClear={clearText}
                onChange={(e) => setSearchText(e.target.value)}
              ></Input>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => linkToStrategyDetail('add')}
            >
              {t('common.add')}
            </Button>
          </div>
          <CustomTable
            scroll={{ y: 'calc(100vh - 320px)', x: 'calc(100vw - 500px)' }}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={tableLoading}
            rowKey="id"
            onChange={handleTableChange}
          ></CustomTable>
        </div>
      </div>
    </Spin>
  );
};
export default Strategy;
