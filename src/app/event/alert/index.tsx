'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Spin,
  Input,
  Button,
  Checkbox,
  Space,
  Tag,
  Modal,
  message,
} from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { deepClone, getRandomColor } from '@/utils/common';
import { findUnitNameById } from '@/utils/common';
import { ColumnItem, ModalRef, Pagination, TableDataItem } from '@/types';
import { AlertProps } from '@/types/monitor';
import { AlertOutlined } from '@ant-design/icons';
import { FiltersConfig } from '@/types/monitor';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import AlertDetail from './alertDetail';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import dayjs, { Dayjs } from 'dayjs';
import alertStyle from './index.module.less';

const Alert: React.FC<AlertProps> = ({ objects, metrics }) => {
  const { get, patch, isLoading } = useApiClient();
  const { t } = useTranslation();
  const { confirm } = Modal;
  const { convertToLocalizedTime } = useLocalizedTime();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const detailRef = useRef<ModalRef>(null);
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
          icon={<AlertOutlined />}
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
        <>{updated_at ? convertToLocalizedTime(updated_at) : '--'}</>
      ),
    },
    {
      title: t('monitor.title'),
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => <>{record.content || '--'}</>,
    },
    {
      title: t('monitor.index'),
      dataIndex: 'index',
      key: 'index',
      render: (_, record) => <>{showMetricName(record)}</>,
    },
    {
      title: t('monitor.value'),
      dataIndex: 'value',
      key: 'value',
      render: (_, record) => <>{record.value + getUnit(record)}</>,
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
      render: (_, record) => <>{showNotifiers(record)}</>,
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            type="link"
            disabled={record.status !== 'new'}
            onClick={() => showAlertCloseConfirm(record)}
          >
            {t('common.close')}
          </Button>
          <Button
            className="ml-[10px]"
            type="link"
            onClick={() => openAlertDetail(record)}
          >
            {t('common.detail')}
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

  const showAlertCloseConfirm = (row: TableDataItem) => {
    confirm({
      title: t('monitor.closeTitle'),
      content: t('monitor.closeContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await patch(`/api/monitor_alert/${row.id}/`, {
              status: 'closed',
            });
            message.success(t('monitor.successfullyClosed'));
            getAssetInsts('refresh');
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

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
      //   created_at_after: dayjs(timeRange[0]).toISOString(),
      //   created_at_before: dayjs(timeRange[1]).toISOString(),
    };
  };

  const showTitle = (row: TableDataItem) => {
    const objectName =
      objects.find((item) => item.id === row.monitor_instance?.monitor_object)
        ?.name || '--';
    const instName = row.monitor_instance?.name || '--';
    const condition = (row.policy?.threshold || []).find(
      (item: TableDataItem) => item.level === row.level
    );
    let _condition = '--';
    if (condition) {
      _condition = condition.method + condition.value;
    }
    return `${objectName}（${instName}）${showMetricName(
      row
    )} ${_condition}${getUnit(row)}`;
  };

  const getUnit = (row: TableDataItem) => {
    return findUnitNameById(
      metrics.find((item) => item.id === row.policy?.metric)?.unit || ''
    );
  };

  const showMetricName = (row: TableDataItem) => {
    return (
      metrics.find((item) => item.id === row.policy?.metric)?.display_name ||
      '--'
    );
  };

  const showNotifiers = (row: TableDataItem) => {
    return (row.policy?.notice_users || []).join(',');
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
      setTableData(data.items);
      setPagination((pre) => ({
        ...pre,
        total: data.count,
      }));
    } finally {
      //   setTableData([
      //     {
      //       id: 2,
      //       policy: {
      //         id: 5,
      //         created_by: 'baiyf-git',
      //         updated_by: 'baiyf-git',
      //         created_at: '2024-11-28T19:31:13+0800',
      //         updated_at: '2024-11-28T19:31:18+0800',
      //         query: 'pod_cpu_utilization',
      //         name: 'pod策略1',
      //         organizations: ['076e87e2-a958-4937-8726-49ae000f21dc'],
      //         source: {
      //           type: 'instance',
      //           values: [
      //             '76f98e2a-f74c-42a6-9879-d5362a3fc060',
      //             '787b88dd-fce5-47d2-9bba-42361d474e9e',
      //           ],
      //         },
      //         schedule: {
      //           hour: '*',
      //           minute: '*',
      //           day_of_week: '*',
      //           day_of_month: '*',
      //           month_of_year: '*',
      //         },
      //         period: 100,
      //         algorithm: 'count',
      //         threshold: [
      //           {
      //             level: 'critical',
      //             value: 99999,
      //             method: '>',
      //           },
      //           {
      //             level: 'error',
      //             value: 9999,
      //             method: '>',
      //           },
      //           {
      //             level: 'warning',
      //             value: 999,
      //             method: '>',
      //           },
      //         ],
      //         recovery_condition: 3,
      //         no_data_alert: 3,
      //         notice: false,
      //         notice_type: 'email',
      //         notice_users: ['baiyf-git'],
      //         monitor_object: 5,
      //         metric: 73,
      //       },
      //       monitor_instance: {
      //         id: '626c1bf6-c5fc-4c7a-9f17-069f62a6612f',
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-11-27T19:29:12+0800',
      //         updated_at: '2024-11-27T19:29:12+0800',
      //         name: 'kube-service-8668ff6859-n6r2g',
      //         interval: 10,
      //         agent_id: 'k3s-node-2',
      //         auto: true,
      //         monitor_object: 5,
      //       },
      //       created_at: '2024-11-28T19:37:38+0800',
      //       updated_at: '2024-11-28T19:37:40+0800',
      //       alert_type: 'alert',
      //       level: 'critical',
      //       status: 'new',
      //       start_event_id: 2,
      //       start_event_time: '2024-11-28T19:33:52+0800',
      //       end_event_id: 3,
      //       end_event_time: '2024-11-28T19:33:52+0800',
      //       operator: 'baiyf-git',
      //     },
      //   ]);
      setTableLoading(false);
    }
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    getAssetInsts('refresh');
  };

  const openAlertDetail = (row: TableDataItem) => {
    detailRef.current?.showModal({
      title: t('monitor.alertDetail'),
      type: 'add',
      form: {
        ...row,
        alertTitle: showTitle(row),
        alertValue: row.value + getUnit(row),
      },
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
      <AlertDetail
        ref={detailRef}
        objects={objects}
        metrics={metrics}
        onSuccess={() => getAssetInsts('refresh')}
      />
    </div>
  );
};

export default Alert;
