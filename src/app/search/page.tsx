'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Select, Button, Segmented, Input } from 'antd';
import { BellOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import useApiClient from '@/utils/request';
import TimeSelector from '@/components/time-selector';
import Collapse from '@/components/collapse';
import searchStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import LineChart from '@/components/line-chart';
import { ListItem, ColumnItem } from '@/types';
import { ObectItem, MetricItem } from '@/types/monitor';
import { deepClone } from '@/utils/common';
import { CONDITION_LIST } from '@/constants/monitor';
import CustomTable from '@/components/custom-table';
const { Option } = Select;

interface ConditionItem {
  label: string | null;
  condition: string | null;
  value: string;
}

interface SearchParams {
  time?: number;
  end?: number;
  start?: number;
  step?: number;
  query: string;
}

const Search = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [objLoading, setObjLoading] = useState<boolean>(false);
  const [metric, setMetric] = useState<string | null>();
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [instanceLoading, setInstanceLoading] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<string[]>();
  const [instances, setInstances] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [object, setObject] = useState<string>();
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('area');
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [timeRange, setTimeRange] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [frequence, setFrequence] = useState<number>(0);
  const isArea: boolean = activeTab === 'area';
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      handleSearch('timer', activeTab);
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [activeTab, frequence, object, metric, conditions, instances, timeRange]);

  const getObjects = async () => {
    try {
      setObjLoading(true);
      const data = await get('/api/monitor_object/');
      setObjects(data);
    } finally {
      setObjLoading(false);
    }
  };

  const getMetrics = async (params = {}) => {
    try {
      setMetricsLoading(true);
      const data = await get('/api/metrics/', {
        params,
      });
      setMetrics(data);
    } finally {
      setMetricsLoading(false);
    }
  };

  const getInstList = async (id: number) => {
    try {
      setInstanceLoading(true);
      const data = await get(`/api/monitor_instance/${id}/list/`);
      setInstances(data);
    } finally {
      setInstanceLoading(false);
    }
  };

  const canSearch = () => {
    return !!metric && instanceId?.length;
  };

  const getParams = () => {
    const _query: string =
      metrics.find((item) => item.name === metric)?.query || '';
    const params: SearchParams = { query: '' };
    const startTime = timeRange.at(0);
    const endTime = timeRange.at(1);
    if (startTime && endTime) {
      params.start = new Date(startTime).getTime();
      params.end = new Date(endTime).getTime();
      params.step = Math.ceil((params.end / 1000 - params.start / 1000) / 360);
    }
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
    params.query = _query.replace(/__\$labels__/g, query);
    return params;
  };

  const onTimeChange = (val: string[]) => {
    setTimeRange(val);
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    handleSearch('refresh', activeTab);
  };

  const createPolicy = () => {
    console.log('创建监控策略');
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
    setInstanceId([]);
    setInstances([]);
    setConditions([]);
    if (val) {
      getMetrics({
        monitor_object_name: val,
      });
    }
    const id = objects.find((item) => item.name === val)?.id || 0;
    if (id) {
      getInstList(id);
    }
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

  const searchData = () => {
    handleSearch('refresh', activeTab);
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
    handleSearch('refresh', val);
  };

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
            title: item.metric['__name__'],
            [`value${index + 1}`]: parseFloat(value),
          });
        }
      });
    });
    return result;
  };

  const handleSearch = async (type: string, tab: string) => {
    if (type !== 'timer') {
      setChartData([]);
      setTableData([]);
    }
    if (!canSearch()) {
      return;
    }
    try {
      setPageLoading(type === 'refresh');
      const areaCurrent = tab === 'area';
      const url = areaCurrent
        ? '/api/metrics_instance/query_range/'
        : '/api/metrics_instance/query/';
      let params = getParams();
      if (!areaCurrent) {
        params = {
          time: params.end,
          query: params.query,
        };
      }
      const responseData = await get(url, {
        params,
      });
      const data = responseData.data?.result || [];
      if (areaCurrent) {
        setChartData(data);
      } else {
        const _tableData = data.map((item: any, index: number) => ({
          ...item.metric,
          value: item.value[1] ?? '--',
          index,
        }));
        const tableColumns = Object.keys(_tableData[0])
          .map((item) => ({
            title: item,
            dataIndex: item,
            key: item,
            width: 200,
            ellipsis: {
              showTitle: true,
            },
          }))
          .filter((item) => item.key !== 'index');
        const _columns = deepClone(tableColumns);
        _columns[0].fixed = 'left';
        setColumns(_columns);
        setTableData(_tableData);
      }
    } finally {
      setPageLoading(false);
    }
  };

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
          onClick={searchData}
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
                  loading={instanceLoading}
                  value={instanceId}
                  onChange={handleInstanceChange}
                >
                  {instances.map((item, index) => {
                    return (
                      <Option value={item.instance_id} key={index}>
                        {item.instance_id}
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
                          placeholder={t('monitor.term')}
                          value={conditionItem.condition}
                          onChange={(val) => handleConditionChange(val, index)}
                        >
                          {CONDITION_LIST.map(
                            (item: ListItem, index: number) => {
                              return (
                                <Option value={item.id} key={index}>
                                  {item.name}
                                </Option>
                              );
                            }
                          )}
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
              <LineChart data={processData(chartData)} />
            </div>
          ) : (
            <CustomTable
              scroll={{ y: 300 }}
              columns={columns}
              dataSource={tableData}
              pagination={false}
              rowKey="index"
            ></CustomTable>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default Search;
