'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Button, Tag, Tabs, Spin } from 'antd';
import OperateModal from '@/components/operate-drawer';
import { useTranslation } from '@/utils/i18n';
import {
  ModalRef,
  ModalConfig,
  TableDataItem,
  TabItem,
  ChartData,
  ColumnItem,
  Pagination,
} from '@/types';
import { ChartDataItem, SearchParams, MetricItem } from '@/types/monitor';
import { AlertOutlined } from '@ant-design/icons';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import useApiClient from '@/utils/request';
import Information from './information';
import CustomTable from '@/components/custom-table';
import { findUnitNameById } from '@/utils/common';
import { LEVEL_MAP } from '@/constants/monitor';

const AlertDetail = forwardRef<ModalRef, ModalConfig>(
  ({ objects, metrics, onSuccess }, ref) => {
    const { t } = useTranslation();
    const { get } = useApiClient();
    const { convertToLocalizedTime } = useLocalizedTime();
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [formData, setFormData] = useState<TableDataItem>({});
    const [title, setTitle] = useState<string>('');
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [tabs, setTabs] = useState<TabItem[]>([
      {
        label: t('monitor.information'),
        key: 'information',
      },
      {
        label: t('menu.event'),
        key: 'event',
      },
    ]);
    const [activeTab, setActiveTab] = useState<string>('information');
    const [loading, setLoading] = useState<boolean>(false);
    const [tableData, setTableData] = useState<TableDataItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const isInformation = activeTab === 'information';
    const columns: ColumnItem[] = [
      {
        title: t('monitor.level'),
        dataIndex: 'level',
        key: 'level',
        render: (_, { level }) => (
          <Tag icon={<AlertOutlined />} color={LEVEL_MAP[level] as string}>
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
        title: t('monitor.eventName'),
        dataIndex: 'title',
        key: 'title',
        render: (_, record) => <>{record.name || '--'}</>,
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
    ];

    useImperativeHandle(ref, () => ({
      showModal: ({ title, form }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setTitle(title);
        setFormData(form);
      },
    }));

    useEffect(() => {
      if (groupVisible) {
        isInformation ? getChartData() : getTableData();
      }
    }, [formData, groupVisible, activeTab]);

    const getUnit = (row: TableDataItem) => {
      return findUnitNameById(
        metrics.find((item: MetricItem) => item.id === row.policy?.metric)
          ?.unit || ''
      );
    };

    const showMetricName = (row: TableDataItem) => {
      return (
        metrics.find((item: MetricItem) => item.id === row.policy?.metric)
          ?.display_name || '--'
      );
    };

    const getParams = () => {
      const _query: string = formData.policy.query;
      const params: SearchParams = {
        query: _query.replace(
          /__\$labels__/g,
          `instance_id="${formData.monitor_instance?.id}"`
        ),
      };
      const startTime = new Date(formData.start_event_time).getTime();
      const endTime = new Date(formData.end_event_time).getTime();
      const MAX_POINTS = 100; // 最大数据点数
      const DEFAULT_STEP = 360; // 默认步长
      if (startTime && endTime) {
        params.start = startTime;
        params.end = endTime;
        params.step = Math.max(
          Math.ceil(
            (params.end / MAX_POINTS - params.start / MAX_POINTS) / DEFAULT_STEP
          ),
          1
        );
      }
      return params;
    };

    const getTableData = async () => {
      setTableLoading(true);
      try {
        const data = await get(`/api/monitor_event/query/${formData.id}/`);
        setTableData(data);
      } finally {
        setTableLoading(false);
      }
    };

    const getChartData = async () => {
      setLoading(true);
      try {
        const responseData = await get(`/api/metrics_instance/query_range/`, {
          params: getParams(),
        });
        const data = responseData.data?.result || [];
        setChartData(data);
      } finally {
        setLoading(false);
      }
    };

    const processData = (data: ChartDataItem[]): ChartData[] => {
      const result: any[] = [];
      const target =
        metrics.find((item: MetricItem) => item.id === formData.policy?.metric)
          ?.dimensions || [];
      data.forEach((item, index) => {
        item.values.forEach(([timestamp, value]) => {
          const existing = result.find((entry) => entry.time === timestamp);
          const detailValue = Object.entries(item.metric)
            .map(([key, dimenValue]) => ({
              name: key,
              label:
                key === 'instance_name'
                  ? 'Instance Name'
                  : target.find((sec: MetricItem) => sec.name === key)
                    ?.description || key,
              value: dimenValue,
            }))
            .filter(
              (item) =>
                item.name === 'instance_name' ||
                target.find((tex: MetricItem) => tex.name === item.name)
            );
          if (existing) {
            existing[`value${index + 1}`] = parseFloat(value);
            if (!existing.details[`value${index + 1}`]) {
              existing.details[`value${index + 1}`] = [];
            }
            existing.details[`value${index + 1}`].push(...detailValue);
          } else {
            const details = {
              [`value${index + 1}`]: detailValue,
            };
            result.push({
              time: timestamp,
              title:
                metrics.find(
                  (sec: MetricItem) => sec.id === formData.policy?.metric
                )?.display_name || '--',
              [`value${index + 1}`]: parseFloat(value),
              details,
            });
          }
        });
      });
      return result;
    };

    const handleCancel = () => {
      setGroupVisible(false);
      setActiveTab('information');
      setChartData([]);
      setTableData([]);
    };
    const changeTab = (val: string) => {
      setActiveTab(val);
    };

    const closeModal = () => {
      handleCancel();
      onSuccess();
    };

    const handleTableChange = (pagination: any) => {
      setPagination(pagination);
    };

    return (
      <div>
        <OperateModal
          title={title}
          visible={groupVisible}
          width={800}
          onClose={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <div>
            <div>
              <div>
                <Tag
                  icon={<AlertOutlined />}
                  color={LEVEL_MAP[formData.level] as string}
                >
                  {formData.level}
                </Tag>
                <b>{formData.content || '--'}</b>
              </div>
              <ul className="flex mt-[10px]">
                <li className="mr-[20px]">
                  <span>{t('common.time')}：</span>
                  <span>
                    {formData.updated_at
                      ? convertToLocalizedTime(formData.updated_at)
                      : '--'}
                  </span>
                </li>
                <li>
                  <span>{t('monitor.state')}：</span>
                  <Tag
                    color={
                      formData.status === 'new' ? 'blue' : 'var(--color-text-4)'
                    }
                  >
                    {formData.status}
                  </Tag>
                </li>
              </ul>
            </div>
            <Tabs activeKey={activeTab} items={tabs} onChange={changeTab} />
            <Spin className="w-full" spinning={loading}>
              {isInformation ? (
                <Information
                  formData={formData}
                  objects={objects}
                  metrics={metrics}
                  onClose={closeModal}
                  chartData={processData(chartData || [])}
                />
              ) : (
                <CustomTable
                  scroll={{ y: 'calc(100vh - 300px)' }}
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  loading={tableLoading}
                  rowKey="id"
                  onChange={handleTableChange}
                />
              )}
            </Spin>
          </div>
        </OperateModal>
      </div>
    );
  }
);

AlertDetail.displayName = 'alertDetail';
export default AlertDetail;
