'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Input, Button, Checkbox, Space, Tag } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { deepClone, getRandomColor } from '@/utils/common';
import { ColumnItem, ModalRef, Pagination, TableDataItem } from '@/types';
import { FiltersConfig } from '@/types/monitor';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import dayjs, { Dayjs } from 'dayjs';
import alertStyle from './index.module.less';

const Alert: React.FC = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const { convertToLocalizedTime } = useLocalizedTime();
  const viewRef = useRef<ModalRef>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [frequence, setFrequence] = useState<number>(0);
  const beginTime: number = dayjs().subtract(15, 'minute').valueOf();
  const lastTime: number = dayjs().valueOf();
  const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
  const [times, setTimes] = useState<[Dayjs, Dayjs] | null>(null);
  const [timeRangeValue, setTimeRangeValue] = useState<number>(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<FiltersConfig>({
    level: [],
    state: [],
    notify: [],
  });

  const columns: ColumnItem[] = [
    {
      title: t('monitor.level'),
      dataIndex: 'level',
      key: 'level',
      render: (_, { level }) => (
        <Tag
          color={
            level === 'critical'
              ? '#F43B2C'
              : level === 'error'
                ? '#D97007'
                : '#FFAD42'
          }
        >
          {level}
        </Tag>
      ),
    },
    {
      title: t('common.time'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      sorter: (a: any, b: any) => a.id - b.id,
      render: (_, { updated_at }) => (
        <>
          {updated_at
            ? convertToLocalizedTime(new Date(updated_at).toString())
            : '--'}
        </>
      ),
    },
    {
      title: t('monitor.title'),
      dataIndex: 'title',
      key: 'title',
      render: (_, { title }) => <>{title || '--'}</>,
    },
    {
      title: t('monitor.index'),
      dataIndex: 'index',
      key: 'index',
      render: (_, { index }) => <>{index || '--'}</>,
    },
    {
      title: t('monitor.value'),
      dataIndex: 'value',
      key: 'value',
      render: (_, { value }) => <>{value || '--'}</>,
    },
    {
      title: t('monitor.state'),
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'new' ? 'blue' : 'var(--color-text-4)'}>
          {status}
        </Tag>
      ),
    },
    {
      title: t('monitor.notify'),
      dataIndex: 'notify',
      key: 'notify',
      render: (_, { notify }) => <>{notify || '--'}</>,
    },
    {
      title: t('common.operator'),
      dataIndex: 'operator',
      key: 'operator',
      render: (_, { operator }) => {
        return operator ? (
          <div className="column-user" title={operator}>
            <span
              className="user-avatar"
              style={{ background: getRandomColor() }}
            >
              {operator.slice(0, 1).toLocaleUpperCase()}
            </span>
            <span className="user-name">{operator}</span>
          </div>
        ) : (
          <>--</>
        );
      },
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            className="ml-[10px]"
            type="link"
            onClick={() => openViewModal(record)}
          >
            {t('common.close')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      getAssetInsts('timer');
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [
    frequence,
    timeRange,
    filters.level,
    filters.state,
    pagination.current,
    pagination.pageSize,
  ]);

  useEffect(() => {
    if (isLoading) return;
    getAssetInsts('refresh');
  }, [
    isLoading,
    timeRange,
    filters.level,
    filters.state,
    pagination.current,
    pagination.pageSize,
  ]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const getParams = () => {
    return {
      status_in: filters.state.join(','),
      level_in: filters.level.join(','),
      search: searchText,
      page: pagination.current,
      page_size: pagination.pageSize,
      created_at_after: dayjs(timeRange[0]).format('YYYY-MM-DD'),
      created_at_before: dayjs(timeRange[1]).format('YYYY-MM-DD'),
    };
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const getAssetInsts = async (type: string, text?: string) => {
    const params = getParams();
    if (text) {
      params.search = '';
    }
    try {
      setTableLoading(type !== 'timer');
      const data = await get('/api/monitor_alert/', { params });
      if (!data.count) {
        setTableData([
          {
            id: 1,
            updated_at: '2024-10-28T10:20:31+0000',
            operator: 'whj',
            status: 'new',
            level: 'warning',
          },
          {
            id: 2,
            updated_at: '2024-10-28T10:20:40+0000',
            operator: 'mark',
            status: 'recovery',
            level: 'critical',
          },
        ]);
        setPagination((pre) => ({
          ...pre,
          total: 2,
        }));
        return;
      }
      setTableData(data.items);
      setPagination((pre) => ({
        ...pre,
        total: data.count,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    getAssetInsts('refresh');
  };

  const openViewModal = (row: TableDataItem) => {
    viewRef.current?.showModal({
      title: t('monitor.indexView'),
      type: 'add',
      form: row,
    });
  };

  const onTimeChange = (val: number[]) => {
    setTimeRange(val);
  };

  const onFilterChange = (
    checkedValues: string[],
    field: keyof FiltersConfig
  ) => {
    const _filters = deepClone(filters);
    _filters[field] = checkedValues;
    setFilters(_filters);
  };

  const enterText = () => {
    getAssetInsts('refresh');
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts('refresh', 'clear');
  };

  return (
    <div className="w-full">
      <Spin spinning={pageLoading}>
        <div className={alertStyle.alert}>
          <div className={alertStyle.filters}>
            <h3 className="font-[800] mb-[20px]">{t('monitor.filterItems')}</h3>
            <div className="mb-[15px]">
              <h4 className="font-[600] text-[var(--color-text-3)] mb-[10px]">
                {t('monitor.level')}
              </h4>
              <Checkbox.Group
                className="ml-[20px]"
                onChange={(checkeds) => onFilterChange(checkeds, 'level')}
              >
                <Space direction="vertical">
                  <Checkbox value="=critical">
                    <div className={alertStyle.level}>
                      {t('monitor.critical')}
                    </div>
                  </Checkbox>
                  <Checkbox value="error">
                    <div
                      className={alertStyle.level}
                      style={{ borderColor: '#D97007' }}
                    >
                      {t('monitor.error')}
                    </div>
                  </Checkbox>
                  <Checkbox value="warning">
                    <div
                      className={alertStyle.level}
                      style={{ borderColor: '#FFAD42' }}
                    >
                      {t('monitor.warning')}
                    </div>
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </div>
            <div className="mb-[15px]">
              <h4 className="font-[600] text-[var(--color-text-3)] mb-[10px]">
                {t('monitor.state')}
              </h4>
              <Checkbox.Group
                className="ml-[20px]"
                onChange={(checkeds) => onFilterChange(checkeds, 'state')}
              >
                <Space direction="vertical">
                  <Checkbox value="new">{t('monitor.new')}</Checkbox>
                  <Checkbox value="recovered">{t('monitor.recovery')}</Checkbox>
                  <Checkbox value="closed">{t('monitor.closed')}</Checkbox>
                </Space>
              </Checkbox.Group>
            </div>
            {/* <div className="mb-[15px]">
              <h4 className="font-[600] text-[var(--color-text-3)] mb-[10px]">
                {t('monitor.notify')}
              </h4>
              <Checkbox.Group
                className="ml-[20px]"
                onChange={(checkeds) => onFilterChange(checkeds, 'notify')}
              >
                <Space direction="vertical">
                  <Checkbox value="Notified">{t('monitor.notified')}</Checkbox>
                  <Checkbox value="Unnotified">
                    {t('monitor.unnotified')}
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </div> */}
          </div>
          <div className={alertStyle.table}>
            <div className="flex justify-between mb-[10px]">
              <Input
                allowClear
                className="w-[350px]"
                placeholder={t('common.searchPlaceHolder')}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={enterText}
                onClear={clearText}
              />
              <TimeSelector
                value={{
                  timesValue: times,
                  timeRangeValue,
                }}
                onChange={(value) => onTimeChange(value)}
                onFrequenceChange={onFrequenceChange}
                onRefresh={onRefresh}
              />
            </div>
            <CustomTable
              scroll={{ y: 'calc(100vh - 300px)', x: 'calc(100vw - 300px)' }}
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={tableLoading}
              rowKey="id"
              onChange={handleTableChange}
            />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Alert;
