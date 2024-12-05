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
import {
  ColumnItem,
  ModalRef,
  Pagination,
  TableDataItem,
  UserItem,
} from '@/types';
import { AlertProps } from '@/types/monitor';
import { AlertOutlined } from '@ant-design/icons';
import { FiltersConfig } from '@/types/monitor';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import AlertDetail from './alertDetail';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import dayjs, { Dayjs } from 'dayjs';
import { useCommon } from '@/context/common';
import alertStyle from './index.module.less';
import { LEVEL_MAP, LEVEL_LIST, STATE_MAP } from '@/constants/monitor';

const Alert: React.FC<AlertProps> = ({ objects, metrics }) => {
  const { get, patch, isLoading } = useApiClient();
  const { t } = useTranslation();
  const { confirm } = Modal;
  const { convertToLocalizedTime } = useLocalizedTime();
  const commonContext = useCommon();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const detailRef = useRef<ModalRef>(null);
  const users = useRef(commonContext?.userList || []);
  const userList: UserItem[] = users.current;
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
        <Tag icon={<AlertOutlined />} color={LEVEL_MAP[level] as string}>
          {LEVEL_LIST.find((item) => item.value === level)?.label || '--'}
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
      render: (_, record) => (
        <>
          {record.value ?? '--'}
          {getUnit(record)}
        </>
      ),
    },
    {
      title: t('monitor.state'),
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'new' ? 'blue' : 'var(--color-text-4)'}>
          {STATE_MAP[status]}
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

  const getUsers = (id: string) => {
    return userList.find((item) => item.id === id)?.username || '--';
  };

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
    return (row.policy?.notice_users || [])
      .map((item: string) => getUsers(item))
      .join(',');
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
      setTableData(data.results);
      setPagination((pre) => ({
        ...pre,
        total: data.count,
      }));
    } finally {
      //   setTableData([
      //     {
      //       id: 3,
      //       created_at: '2024-12-05T16:54:00+0800',
      //       updated_at: '2024-12-05T16:54:00+0800',
      //       policy_id: 10,
      //       monitor_instance_id: 'lite',
      //       alert_type: 'alert',
      //       level: 'critical',
      //       value: 8800.0,
      //       content: 'OS-Host  cpu_summary.usage > 98',
      //       status: 'new',
      //       start_event_id: 60,
      //       start_event_time: '2024-12-05T16:54:00+0800',
      //       end_event_id: null,
      //       end_event_time: null,
      //       operator: 'system',
      //       policy: {
      //         id: 10,
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-12-04T17:28:55+0800',
      //         updated_at: '2024-12-05T17:30:06+0800',
      //         filter: [
      //           {
      //             name: 'cpu',
      //             value: '1',
      //             method: '!=',
      //           },
      //           {
      //             name: 'cpu',
      //             value: '0',
      //             method: '=~',
      //           },
      //         ],
      //         name: '123',
      //         organizations: ['dde252a5-73c3-4b6f-8f3b-7c3ef95cee83'],
      //         source: {
      //           type: 'organization',
      //           values: ['dde252a5-73c3-4b6f-8f3b-7c3ef95cee83'],
      //         },
      //         schedule: {
      //           type: 'min',
      //           value: 1,
      //         },
      //         period: 60,
      //         algorithm: 'sum',
      //         threshold: [
      //           {
      //             level: 'critical',
      //             value: 99,
      //             method: '>',
      //           },
      //           {
      //             level: 'error',
      //             value: 999,
      //             method: '>',
      //           },
      //           {
      //             level: 'warning',
      //             value: 9999,
      //             method: '>',
      //           },
      //         ],
      //         recovery_condition: 1,
      //         no_data_alert: 0,
      //         no_data_level: 'critical',
      //         notice: true,
      //         notice_type: 'email',
      //         notice_users: [
      //           'c5719e53-d368-4412-b12e-c135b09bfa35',
      //           '7532d08d-928b-4ac4-b07f-36cb4a91f8cc',
      //           '21ce969d-e31d-4f3f-8e0a-287846d89cf2',
      //         ],
      //         monitor_object: 1,
      //         metric: 1,
      //       },
      //       monitor_instance: {
      //         id: 'lite',
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-11-26T10:55:59+0800',
      //         updated_at: '2024-11-26T10:55:59+0800',
      //         name: 'k8s-lite-cluster',
      //         interval: 10,
      //         agent_id: 'k3s-node-2',
      //         auto: true,
      //         monitor_object: 4,
      //       },
      //     },
      //     {
      //       id: 2,
      //       created_at: '2024-12-05T16:43:02+0800',
      //       updated_at: '2024-12-05T16:53:22+0800',
      //       policy_id: 10,
      //       monitor_instance_id: 'lite',
      //       alert_type: 'alert',
      //       level: 'critical',
      //       value: 8800.0,
      //       content: 'OS-Host  cpu_summary.usage > 98',
      //       status: 'closed',
      //       start_event_id: 2,
      //       start_event_time: '2024-12-05T16:43:02+0800',
      //       end_event_id: null,
      //       end_event_time: null,
      //       operator: 'system',
      //       policy: {
      //         id: 10,
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-12-04T17:28:55+0800',
      //         updated_at: '2024-12-05T17:30:06+0800',
      //         filter: [
      //           {
      //             name: 'cpu',
      //             value: '1',
      //             method: '!=',
      //           },
      //           {
      //             name: 'cpu',
      //             value: '0',
      //             method: '=~',
      //           },
      //         ],
      //         name: '123',
      //         organizations: ['dde252a5-73c3-4b6f-8f3b-7c3ef95cee83'],
      //         source: {
      //           type: 'organization',
      //           values: ['dde252a5-73c3-4b6f-8f3b-7c3ef95cee83'],
      //         },
      //         schedule: {
      //           type: 'min',
      //           value: 1,
      //         },
      //         period: 60,
      //         algorithm: 'sum',
      //         threshold: [
      //           {
      //             level: 'critical',
      //             value: 99,
      //             method: '>',
      //           },
      //           {
      //             level: 'error',
      //             value: 999,
      //             method: '>',
      //           },
      //           {
      //             level: 'warning',
      //             value: 9999,
      //             method: '>',
      //           },
      //         ],
      //         recovery_condition: 1,
      //         no_data_alert: 0,
      //         no_data_level: 'critical',
      //         notice: true,
      //         notice_type: 'email',
      //         notice_users: [
      //           'c5719e53-d368-4412-b12e-c135b09bfa35',
      //           '7532d08d-928b-4ac4-b07f-36cb4a91f8cc',
      //           '21ce969d-e31d-4f3f-8e0a-287846d89cf2',
      //         ],
      //         monitor_object: 1,
      //         metric: 1,
      //       },
      //       monitor_instance: {
      //         id: 'lite',
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-11-26T10:55:59+0800',
      //         updated_at: '2024-11-26T10:55:59+0800',
      //         name: 'k8s-lite-cluster',
      //         interval: 10,
      //         agent_id: 'k3s-node-2',
      //         auto: true,
      //         monitor_object: 4,
      //       },
      //     },
      //     {
      //       id: 1,
      //       created_at: '2024-12-05T16:43:02+0800',
      //       updated_at: '2024-12-05T16:43:02+0800',
      //       policy_id: 10,
      //       monitor_instance_id: '10.10.26.236',
      //       alert_type: 'alert',
      //       level: 'critical',
      //       value: 2200.0,
      //       content: 'OS-Host  cpu_summary.usage > 98',
      //       status: 'new',
      //       start_event_id: 1,
      //       start_event_time: '2024-12-05T16:43:02+0800',
      //       end_event_id: null,
      //       end_event_time: null,
      //       operator: 'system',
      //       policy: {
      //         id: 10,
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-12-04T17:28:55+0800',
      //         updated_at: '2024-12-05T17:30:06+0800',
      //         filter: [
      //           {
      //             name: 'cpu',
      //             value: '1',
      //             method: '!=',
      //           },
      //           {
      //             name: 'cpu',
      //             value: '0',
      //             method: '=~',
      //           },
      //         ],
      //         name: '123',
      //         organizations: ['dde252a5-73c3-4b6f-8f3b-7c3ef95cee83'],
      //         source: {
      //           type: 'organization',
      //           values: ['dde252a5-73c3-4b6f-8f3b-7c3ef95cee83'],
      //         },
      //         schedule: {
      //           type: 'min',
      //           value: 1,
      //         },
      //         period: 60,
      //         algorithm: 'sum',
      //         threshold: [
      //           {
      //             level: 'critical',
      //             value: 99,
      //             method: '>',
      //           },
      //           {
      //             level: 'error',
      //             value: 999,
      //             method: '>',
      //           },
      //           {
      //             level: 'warning',
      //             value: 9999,
      //             method: '>',
      //           },
      //         ],
      //         recovery_condition: 1,
      //         no_data_alert: 0,
      //         no_data_level: 'critical',
      //         notice: true,
      //         notice_type: 'email',
      //         notice_users: [
      //           'c5719e53-d368-4412-b12e-c135b09bfa35',
      //           '7532d08d-928b-4ac4-b07f-36cb4a91f8cc',
      //           '21ce969d-e31d-4f3f-8e0a-287846d89cf2',
      //         ],
      //         monitor_object: 1,
      //         metric: 1,
      //       },
      //       monitor_instance: {
      //         id: '10.10.26.236',
      //         created_by: '',
      //         updated_by: '',
      //         created_at: '2024-12-04T15:30:47+0800',
      //         updated_at: '2024-12-04T15:30:47+0800',
      //         name: 'WeDoc\u5b98\u7f51',
      //         interval: 10,
      //         agent_id: '10.10.26.236',
      //         auto: true,
      //         monitor_object: 2,
      //       },
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
                      style={{
                        borderLeft: `4px solid ${LEVEL_MAP.error}`,
                      }}
                    >
                      {t('monitor.error')}
                    </div>
                  </Checkbox>
                  <Checkbox value="warning">
                    <div
                      className={alertStyle.level}
                      style={{
                        borderLeft: `4px solid ${LEVEL_MAP.warning}`,
                      }}
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
        userList={userList}
        onSuccess={() => getAssetInsts('refresh')}
      />
    </div>
  );
};

export default Alert;
