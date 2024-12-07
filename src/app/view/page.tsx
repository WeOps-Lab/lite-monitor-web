'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Spin, Input, Button, Segmented, Tabs, Cascader, Progress } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/utils/common';
import { useRouter } from 'next/navigation';
import { IntergrationItem, ObectItem, MetricItem } from '@/types/monitor';
import ViewModal from './viewModal';
import { TabItem, Organization, ColumnItem, ModalRef } from '@/types';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import { useCommon } from '@/context/common';
import { showGroupName } from '@/utils/common';
import { INDEX_CONFIG } from '@/constants/monitor';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';

const Intergration = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const router = useRouter();
  const commonContext = useCommon();
  const { convertToLocalizedTime } = useLocalizedTime();
  const authList = useRef(commonContext?.authOrganizations || []);
  const viewRef = useRef<ModalRef>(null);
  const organizationList: Organization[] = authList.current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [apps, setApps] = useState<TabItem[]>([]);
  const [objectId, setObjectId] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [frequence, setFrequence] = useState<number>(0);
  const columns: ColumnItem[] = [
    {
      title: t('common.name'),
      dataIndex: 'instance_name',
      key: 'instance_name',
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => linkToDetial(record)}>
            {t('common.detail')}
          </Button>
          <Button
            className="ml-[10px]"
            type="link"
            onClick={() => openViewModal(record)}
          >
            {t('menu.view')}
          </Button>
        </>
      ),
    },
  ];
  const [tableColumn, setTableColumn] = useState<ColumnItem[]>(columns);

  useEffect(() => {
    if (activeTab) {
      const target = items.find((item) => item.value === activeTab);
      if (target?.list) {
        const list = deepClone(target.list);
        setObjectId(list[0].key);
        setApps(list);
      }
    }
  }, [activeTab, items]);

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  useEffect(() => {
    if (objectId) {
      setPagination((prev: any) => ({
        ...prev,
        current: 1,
      }));
      setFilteredData([]);
      getColoumnAndData();
    }
  }, [objectId]);

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      getAssetInsts(objectId, 'timer');
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [frequence, objectId]);

  useEffect(() => {
    applyFilters();
  }, [
    tableData,
    searchText,
    selectedOrganizations,
    pagination.current,
    pagination.pageSize,
  ]);

  const getColoumnAndData = async () => {
    const getInstList = get(`/api/monitor_instance/${objectId}/list/`);
    const getMetrics = get('/api/metrics/', {
      params: {
        monitor_object_id: objectId,
      },
    });
    setTableLoading(true);
    try {
      const res = await Promise.all([getInstList, getMetrics]);
      setTableData(res[0]);
      const _objectName = apps.find((item) => item.key === objectId)?.label;
      if (_objectName) {
        const filterMetrics =
          INDEX_CONFIG.find((item) => item.name === _objectName)
            ?.tableDiaplay || [];
        const data = (res[1] || []).filter((item: MetricItem) =>
          filterMetrics.includes(item.name)
        );
        const _columns = data.map((item: MetricItem) => {
          return {
            title: item.display_name,
            dataIndex: item.name,
            key: item.name,
            width: 200,
            render: (_: any, record: any) => (
              <Progress
                strokeLinecap="butt"
                showInfo={!!record[item.name]}
                percent={record[item.name] || 0}
                percentPosition={{ align: 'center', type: 'inner' }}
                size={[100, 20]}
              />
            ),
          };
        });
        const originColumns = deepClone(columns);
        const indexToInsert = originColumns.length - 2;
        originColumns.splice(indexToInsert, 0, ..._columns);
        setTableColumn(originColumns);
      }
    } catch (error) {
      // Handle error
    } finally {
      setTableLoading(false);
    }
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const applyFilters = useCallback(() => {
    let filtered = tableData;
    // Filter by instance_id
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.instance_id.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // Filter by selected organizations
    if (selectedOrganizations.length > 0) {
      filtered = filtered.filter((item) =>
        selectedOrganizations.some((org) => item.organization.includes(org))
      );
    }
    // Pagination
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    setFilteredData(filtered.slice(start, end));
    setPagination((prev: any) => ({
      ...prev,
      total: filtered.length,
    }));
  }, [
    searchText,
    selectedOrganizations,
    pagination.current,
    pagination.pageSize,
    tableData,
  ]);

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  const changeTab = (val: string) => {
    setObjectId(val);
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      const data = await get(`/api/monitor_object/`, {
        params: {
          name: text || '',
        },
      });
      const _items = getAppsByType(data);
      setItems(_items);
      setActiveTab(_items[0]?.value || '');
    } finally {
      setPageLoading(false);
    }
  };

  const getAssetInsts = async (objectId: React.Key, type?: string) => {
    try {
      setTableLoading(type !== 'timer');
      const data = await get(`/api/monitor_instance/${objectId}/list/`);
      setTableData(data);
    } finally {
      setTableLoading(false);
    }
  };

  const getAppsByType = (data: ObectItem[]): IntergrationItem[] => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {
          label: item.type,
          value: item.type,
          list: [],
        };
      }
      acc[item.type].list.push({
        label: item.name,
        key: item.id,
      });
      return acc;
    }, {} as Record<string, any>);
    return Object.values(groupedData);
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const linkToDetial = (app: ObectItem) => {
    const row = deepClone(app);
    row.name = apps.find((item) => item.key === objectId)?.label;
    row.monitorObjId = apps.find((item) => item.key === objectId)?.key || '';
    const params = new URLSearchParams(row);
    const targetUrl = `/view/detail/overview?${params.toString()}`;
    router.push(targetUrl);
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    getAssetInsts(objectId);
  };

  const openViewModal = (row: any) => {
    viewRef.current?.showModal({
      title: t('monitor.indexView'),
      type: 'add',
      form: row,
    });
  };

  return (
    <div className="w-full">
      <Spin spinning={pageLoading}>
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
        <div className="w-full bg-[var(--color-bg-1)] px-[20px] pb-[20px]">
          <Tabs activeKey={objectId} items={apps} onChange={changeTab} />
          <div>
            <div className="flex justify-between mb-[10px]">
              <div className="flex items-center">
                <Cascader
                  className="mr-[8px]"
                  showSearch
                  options={organizationList}
                  multiple
                  allowClear
                  onChange={(value) => setSelectedOrganizations(value as any)}
                />
                <Input
                  className="w-[320px]"
                  placeholder={t('common.searchPlaceHolder')}
                  onChange={(e) => setSearchText(e.target.value)}
                ></Input>
              </div>
              <TimeSelector
                onlyRefresh
                onFrequenceChange={onFrequenceChange}
                onRefresh={onRefresh}
              />
            </div>
            <CustomTable
              scroll={{ y: 'calc(100vh - 380px)', x: 'calc(100vw - 500px)' }}
              columns={tableColumn}
              dataSource={filteredData}
              pagination={pagination}
              loading={tableLoading}
              rowKey="instance_id"
              onChange={handleTableChange}
            ></CustomTable>
          </div>
        </div>
      </Spin>
      <ViewModal
        ref={viewRef}
        monitorObject={objectId}
        monitorName={apps.find((item) => item.key === objectId)?.label || ''}
      />
    </div>
  );
};
export default Intergration;
