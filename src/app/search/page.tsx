'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Select, Button, Segmented, Progress, Input } from 'antd';
import { BellOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import useApiClient from '@/utils/request';
import TimeSelector from './timeSelector';
import Collapse from '@/components/collapse';
import searchStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
const { Option } = Select;
import { ListItem, ColumnItem } from '@/types';
import { deepClone } from '@/utils/common';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './customTooltips';
import CustomTable from '@/components/custom-table';

interface ConditionItem {
  label: string | null;
  condition: string | null;
  value: string;
}

interface ObectItem {
  id: number;
  name: string;
  type: string;
  [key: string]: unknown;
}

interface metricItem {
  id: number;
  metric_group: number;
  metric_object: number;
  name: string;
  type: string;
  dimensions: any[];
  [key: string]: unknown;
}

const colors = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#387908',
  '#ff0000',
];

const processData = (data: any) => {
  const result: any[] = [];
  data.forEach((item: any, index: number) => {
    item.values.forEach(([timestamp, value]: [number, string]) => {
      const time = new Date(timestamp * 1000).toLocaleString();
      const existing = result.find((entry) => entry.time === time);
      if (existing) {
        existing[`value${index + 1}`] = parseFloat(value);
      } else {
        result.push({
          time,
          title: `${item.metric.job_name} - ${item.metric['__name__']}`,
          [`value${index + 1}`]: parseFloat(value),
        });
      }
    });
  });
  return result;
};

const Search = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [objLoading, setObjLoading] = useState<boolean>(false);
  const [metric, setMetric] = useState<string | null>();
  const [metrics, setMetrics] = useState<metricItem[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<string[]>();
  const [instances, setInstances] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [object, setObject] = useState<string>();
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('area');
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [timeRange, setTimeRange] = useState<string[]>([]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const columns: ColumnItem[] = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Value1',
      dataIndex: 'value1',
      key: 'value1',
      render: (_, { value1 }) => <Progress percent={value1} />,
    },
  ];
  const isArea: boolean = activeTab === 'area';
  const [tableData, setTableData] = useState<any[]>([]);

  const conditionList: ListItem[] = [
    { id: '=', name: '=' },
    { id: '!=', name: '!=' },
    { id: '=~', name: 'include' },
    { id: '!~', name: 'exclude' },
  ];

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  const getObjects = async () => {
    try {
      setObjLoading(true);
      const data = await get(`/api/metrics_object/`);
      setObjects(data);
    } finally {
      setObjLoading(false);
    }
  };

  const getMetrics = async (params = {}) => {
    try {
      setMetricsLoading(true);
      const data = await get(`/api/metrics/`, {
        params,
      });
      setMetrics(data);
    } finally {
      setMetricsLoading(false);
    }
  };

  const canSearch = () => {
    return timeRange.every((item) => !!item) && !!metric;
  };

  const getParams = () => {
    const params: any = {};
    const startTime = timeRange.at(0);
    const endTime = timeRange.at(1);
    if (startTime && endTime) {
      params.start = new Date(startTime).getTime();
      params.end = new Date(endTime).getTime();
      params.step = Math.ceil((params.end / 1000 - params.start / 1000) / 360);
      // 生成Prometheus查询语法
      let query = '';
      if (instanceId?.length) {
        query += `instance_id=~"${instanceId.join('|')}"`;
      }
      if (conditions?.length) {
        const conditionQueries = conditions
          .map((condition) => {
            if (condition.label && condition.condition && condition.value) {
              return `${condition.label}${condition.condition}"${condition.value}"`;
            }
            return '';
          })
          .filter(Boolean);
        if (conditionQueries.length) {
          if (query) {
            query += ',';
          }
          query += conditionQueries.join(',');
        }
      }
      params.query = query ? `${metric}{${query}}` : metric;
    }
    return params;
  };

  const onTimeChange = (val: string[]) => {
    setTimeRange(val);
  };

  const onFrequenceChange = (val: number) => {
    console.log(val);
  };

  const onRefresh = () => {
    console.log(123);
  };

  const createPolicy = () => {
    console.log(122);
  };

  const handleInstanceChange = (val: string[]) => {
    setInstanceId(val);
  };

  const handleMetricChange = (val: string) => {
    setMetric(val);
    const _labels = (
      metrics.find((item) => item.name === val)?.dimensions || []
    ).map((item) => item.name);
    setLabels(_labels);
  };

  const handleObjectChange = (val: string) => {
    setObject(val);
    setMetrics([]);
    setLabels([]);
    setMetric(null);
    setConditions([]);
    getMetrics({
      metric_object: val,
    });
  };

  const handleLabelChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].label = val;
    setConditions(_conditions);
  };

  const handleConditionChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].condition = val;
    setConditions(_conditions);
  };

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const _conditions = deepClone(conditions);
    _conditions[index].value = e.target.value;
    setConditions(_conditions);
  };

  const addConditionItem = () => {
    const _conditions = deepClone(conditions);
    _conditions.push({
      label: null,
      condition: null,
      value: null,
    });
    setConditions(_conditions);
  };

  const deleteConditionItem = (index: number) => {
    const _conditions = deepClone(conditions);
    _conditions.splice(index, 1);
    setConditions(_conditions);
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  const handleSearch = async () => {
    try {
      setPageLoading(true);
      const params = getParams();
      const responseData = await get('/api/metrics_instance/query_range/', {
        params,
      });
      setTableData(processData(responseData.result || []));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const initialData = [
      {
        metric: {
          job_name: 'lite-cmdb-init-job',
          __name__: 'kube_job_info_gauge',
        },
        values: [
          [1730169690, '1'],
          [1730171460, '1'],
          [1730175000, '1'],
          [1730182080, '1'],
          [1730183850, '1'],
          [1730189160, '1'],
          [1730267040, '1'],
        ],
      },
      {
        metric: {
          job_name: 'lite-monitor-init-job',
          __name__: 'kube_job_info_gauge',
        },
        values: [[1730456430, '1']],
      },
      {
        metric: {
          job_name: 'lite-node-mgmt-init-job',
          __name__: 'kube_job_info_gauge',
        },
        values: [[1730693610, '1']],
      },
      {
        metric: {
          job_name: 'munchkin-init-job',
          __name__: 'kube_job_info_gauge',
        },
        values: [
          [1730175000, '1'],
          [1730176770, '1'],
          [1730182080, '1'],
          [1730189160, '1'],
          [1730190930, '1'],
          [1730192700, '1'],
          [1730194470, '1'],
          [1730451120, '1'],
          [1730700690, '1'],
          [1730704230, '1'],
        ],
      },
    ];
    setTableData(processData(initialData));
  }, [metric]);

  return (
    <div className={searchStyle.search}>
      <div className={searchStyle.time}>
        <TimeSelector
          onChange={(value, dateString) => {
            onTimeChange(dateString);
          }}
          onFrequenceChange={onFrequenceChange}
          onRefresh={onRefresh}
        />
        <Button
          type="primary"
          className="ml-[8px]"
          disabled={!canSearch()}
          onClick={handleSearch}
        >
          {t('common.search')}
        </Button>
      </div>
      <div className={searchStyle.criteria}>
        <Collapse
          title={t('monitor.searchCriteria')}
          icon={<BellOutlined onClick={createPolicy} />}
        >
          <div className={`${searchStyle.condition} px-[10px]`}>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.source')}</div>
              <div
                className={`${searchStyle.itemOption} ${searchStyle.source}`}
              >
                <Select
                  className={`w-[150px] ${searchStyle.sourceObjectType}`}
                  placeholder={t('monitor.object')}
                  showSearch
                  loading={objLoading}
                  value={object}
                  onChange={handleObjectChange}
                >
                  {objects.map((item, index) => {
                    return (
                      <Option value={item.name} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
                <Select
                  mode="multiple"
                  placeholder={t('monitor.instance')}
                  className={`w-[250px] ${searchStyle.sourceObject}`}
                  maxTagCount="responsive"
                  loading={objLoading}
                  value={instanceId}
                  onChange={handleInstanceChange}
                >
                  {instances.map((item, index) => {
                    return (
                      <Option value={item.id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </div>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.metric')}</div>
              <div className={searchStyle.itemOption}>
                <Select
                  className="w-[250px]"
                  placeholder={t('monitor.metric')}
                  showSearch
                  value={metric}
                  loading={metricsLoading}
                  onChange={handleMetricChange}
                >
                  {metrics.map((item, index) => {
                    return (
                      <Option value={item.name} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </div>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.filter')}</div>
              <div className="flex">
                {conditions.length ? (
                  <ul className={searchStyle.conditions}>
                    {conditions.map((conditionItem, index) => (
                      <li
                        className={`${searchStyle.itemOption} ${searchStyle.filter}`}
                        key={index}
                      >
                        <Select
                          className={`w-[150px] ${searchStyle.filterLabel}`}
                          placeholder={t('monitor.label')}
                          showSearch
                          value={conditionItem.label}
                          onChange={(val) => handleLabelChange(val, index)}
                        >
                          {labels.map((item, index) => {
                            return (
                              <Option value={item} key={index}>
                                {item}
                              </Option>
                            );
                          })}
                        </Select>
                        <Select
                          className="w-[100px]"
                          placeholder={t('monitor.condition')}
                          value={conditionItem.condition}
                          onChange={(val) => handleConditionChange(val, index)}
                        >
                          {conditionList.map((item, index) => {
                            return (
                              <Option value={item.id} key={index}>
                                {item.name}
                              </Option>
                            );
                          })}
                        </Select>
                        <Input
                          className="w-[250px]"
                          placeholder={t('monitor.value')}
                          value={conditionItem.value}
                          onChange={(val) => handleValueChange(val, index)}
                        ></Input>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => deleteConditionItem(index)}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={addConditionItem}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Button
                    disabled={!metric}
                    icon={<PlusOutlined />}
                    onClick={addConditionItem}
                  />
                )}
              </div>
            </div>
          </div>
        </Collapse>
      </div>
      <Spin spinning={pageLoading}>
        <div className={searchStyle.chart}>
          <Segmented
            className="mb-[20px]"
            value={activeTab}
            options={[
              {
                label: (
                  <div className="flex items-center">
                    <Icon type="duijimianjitu" className="mr-[8px]" />
                    {t('monitor.area')}
                  </div>
                ),
                value: 'area',
              },
              {
                label: (
                  <div className="flex items-center">
                    <Icon type="tabulation" className="mr-[8px]" />
                    {t('monitor.table')}
                  </div>
                ),
                value: 'table',
              },
            ]}
            onChange={onTabChange}
          />
          {isArea ? (
            <div className={searchStyle.chartArea}>
              <ResponsiveContainer>
                <AreaChart
                  data={tableData}
                  margin={{
                    top: 10,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'var(--color-text-3)', fontSize: 14 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-3)', fontSize: 14 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {tableData.map((key, index) => (
                    <Area
                      key={index}
                      type="monotone"
                      dataKey={`value${index + 1}`}
                      stroke={colors[index % colors.length]}
                      fillOpacity={0.1}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <CustomTable
              scroll={{ y: 300 }}
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={loading}
              rowKey="id"
              onChange={handleTableChange}
            ></CustomTable>
          )}
        </div>
      </Spin>
    </div>
  );
};
export default Search;
