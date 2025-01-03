'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Select, Button, Segmented, Input } from 'antd';
import { BellOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useConditionList } from '@/constants/monitor';
import useApiClient from '@/utils/request';
import TimeSelector from '@/components/time-selector';
import Collapse from '@/components/collapse';
import searchStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import LineChart from '@/components/charts/lineChart';
import CustomTable from '@/components/custom-table';
import {
  ListItem,
  ColumnItem,
  ChartData,
  TimeSelectorDefaultValue,
} from '@/types';
import { Dayjs } from 'dayjs';
import {
  ObectItem,
  MetricItem,
  ChartDataItem,
  TableDataItem,
  ConditionItem,
  SearchParams,
} from '@/types/monitor';
import { deepClone, findUnitNameById } from '@/utils/common';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
const { Option } = Select;

const Search: React.FC = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const CONDITION_LIST = useConditionList();
  const searchParams = useSearchParams();
  const url_instance_id = searchParams.get('instance_id');
  const url_obj_name = searchParams.get('monitor_object');
  const url_metric_id = searchParams.get('metric_id');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [objLoading, setObjLoading] = useState<boolean>(false);
  const [metric, setMetric] = useState<string | null>(url_metric_id || null);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [instanceLoading, setInstanceLoading] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<string[]>(
    url_instance_id ? [url_instance_id] : []
  );
  const [instances, setInstances] = useState<
    { instance_id: string; instance_name: string }[]
  >([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [object, setObject] = useState<string | undefined>(url_obj_name as any);
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [objectsOptions, setObjectsOptions] = useState<ObectItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('area');
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const beginTime: number = dayjs().subtract(15, 'minute').valueOf();
  const lastTime: number = dayjs().valueOf();
  const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
  const [timeDefaultValue, setTimeDefaultValue] =
    useState<TimeSelectorDefaultValue>({
      selectValue: 15,
      rangePickerVaule: null,
    });
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [frequence, setFrequence] = useState<number>(0);
  const [unit, setUnit] = useState<string>('');
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

  useEffect(() => {
    if (url_obj_name && objects.length) {
      handleObjectChange('otherWay');
    }
  }, [url_instance_id, url_obj_name, url_metric_id, objects]);

  const getObjects = async () => {
    try {
      setObjLoading(true);
      const data: ObectItem[] = await get('/api/monitor_object/');
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = {
            label: item.display_type,
            title: item.type,
            options: [],
          };
        }
        acc[item.type].options.push({
          label: item.display_name,
          value: item.name,
        });
        return acc;
      }, {} as Record<string, any>);
      setObjectsOptions(Object.values(groupedData));
      setObjects(data);
    } finally {
      setObjLoading(false);
    }
  };

  const getMetrics = async (params = {}) => {
    try {
      setMetricsLoading(true);
      const data: MetricItem[] = await get('/api/metrics/', {
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
      const data = await get(`/api/monitor_instance/${id}/list/`, {
        params: {
          page_size: -1,
        },
      });
      setInstances(data.results || []);
    } finally {
      setInstanceLoading(false);
    }
  };

  const canSearch = () => {
    return !!metric && instanceId?.length;
  };

  const getParams = (_timeRange: number[]): SearchParams => {
    const _query: string =
      metrics.find((item) => item.name === metric)?.query || '';
    const params: SearchParams = { query: '' };
    const startTime = _timeRange.at(0);
    const endTime = _timeRange.at(1);
    if (startTime && endTime) {
      const MAX_POINTS = 100; // 最大数据点数
      const DEFAULT_STEP = 360; // 默认步长
      params.start = startTime;
      params.end = endTime;
      params.step = Math.max(
        Math.ceil(
          (params.end / MAX_POINTS - params.start / MAX_POINTS) / DEFAULT_STEP
        ),
        1
      );
    }
    let query = '';
    if (instanceId?.length) {
      switch (object) {
        case 'Pod':
          query += `uid=~"${instanceId.join('|')}"`;
          break;
        case 'Node':
          query += `node=~"${instanceId.join('|')}"`;
          break;
        default:
          query += `instance_id=~"${instanceId.join('|')}"`;
          break;
      }
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

  const onTimeChange = (val: number[]) => {
    setTimeRange(val);
    handleSearch('refresh', activeTab, val);
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
    const params = new URLSearchParams({
      monitorName: object as string,
      monitorObjId: objects.find((item) => item.name === object)?.id + '',
      metricId: metric || '',
      instanceId: instanceId.join(','),
      type: 'add',
    });
    const targetUrl = `/event/strategy?${params.toString()}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInstanceChange = (val: string[]) => {
    setInstanceId(val);
  };

  const handleMetricChange = (val: string) => {
    setMetric(val);
    const target = metrics.find((item) => item.name === val);
    const _labels = (target?.dimensions || []).map((item) => item.name);
    setLabels(_labels);
    setUnit(target?.unit || '');
  };

  const handleObjectChange = (val: string) => {
    if (val !== 'otherWay') {
      setObject(val);
      setMetrics([]);
      setLabels([]);
      setMetric(null);
      setInstanceId([]);
      setInstances([]);
      setConditions([]);
    }
    const value = val === 'otherWay' ? url_obj_name : val;
    if (value) {
      getMetrics({
        monitor_object_name: value,
      });
    }
    const id = objects.find((item) => item.name === value)?.id || 0;
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
      value: '',
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

  const processData = (data: ChartDataItem[]): ChartData[] => {
    const result: any[] = [];
    const target =
      metrics.find((item) => item.name === metric)?.dimensions || [];
    data.forEach((item, index) => {
      item.values.forEach(([timestamp, value]) => {
        const existing = result.find((entry) => entry.time === timestamp);
        const detailValue = Object.entries(item.metric)
          .map(([key, dimenValue]) => ({
            name: key,
            label:
              key === 'instance_name'
                ? 'Instance Name'
                : target.find((sec) => sec.name === key)?.description || key,
            value: dimenValue,
          }))
          .filter(
            (item) =>
              item.name === 'instance_name' ||
              target.find((tex) => tex.name === item.name)
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
              metrics.find((sec) => sec.name === metric)?.display_name || '--',
            [`value${index + 1}`]: parseFloat(value),
            details,
          });
        }
      });
    });
    return result;
  };

  const handleSearch = async (
    type: string,
    tab: string,
    _timeRange = timeRange
  ) => {
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
      let params = getParams(_timeRange);
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
        const metricTarget =
          metrics.find((item) => item.name === metric)?.dimensions || [];
        const colKeys = Array.from(
          new Set(
            metricTarget
              .map((item) => item.name)
              .concat(['instance_name', 'instance_id', 'value'])
          )
        );

        const tableColumns = Object.keys(_tableData[0] || {})
          .filter((item) => colKeys.includes(item))
          .map((item) => ({
            title: item,
            dataIndex: item,
            key: item,
            width: 200,
            ellipsis: {
              showTitle: true,
            },
          }));
        const _columns = deepClone(tableColumns);
        if (_columns[0]) _columns[0].fixed = 'left';
        setColumns(_columns);
        setTableData(_tableData);
      }
    } finally {
      setPageLoading(false);
    }
  };

  const onXRangeChange = (arr: [Dayjs, Dayjs]) => {
    setTimeDefaultValue((pre) => ({
      ...pre,
      rangePickerVaule: arr,
      selectValue: 0,
    }));
    const _times = arr.map((item) => dayjs(item).valueOf());
    setTimeRange(_times);
    handleSearch('refresh', activeTab, _times);
  };

  return (
    <div className={searchStyle.search}>
      <div className={searchStyle.time}>
        <TimeSelector
          defaultValue={timeDefaultValue}
          onChange={(value) => onTimeChange(value)}
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
          title={t('monitor.search.searchCriteria')}
          icon={
            <Button
              disabled={!object}
              onClick={createPolicy}
              type="link"
              size="small"
              icon={<BellOutlined />}
            />
          }
        >
          <div className={searchStyle.condition}>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.source')}</div>
              <div
                className={`${searchStyle.itemOption} ${searchStyle.source}`}
              >
                <Select
                  className={`w-[150px] ${searchStyle.sourceObjectType}`}
                  placeholder={t('monitor.search.object')}
                  showSearch
                  loading={objLoading}
                  value={object}
                  options={objectsOptions}
                  onChange={handleObjectChange}
                />
                <Select
                  mode="multiple"
                  placeholder={t('monitor.instance')}
                  className={`w-[250px] ${searchStyle.sourceObject}`}
                  maxTagCount="responsive"
                  loading={instanceLoading}
                  value={instanceId}
                  onChange={handleInstanceChange}
                >
                  {instances.map((item) => (
                    <Option value={item.instance_id} key={item.instance_id}>
                      {item.instance_name}
                    </Option>
                  ))}
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
                  {metrics.map((item) => (
                    <Option value={item.name} key={item.name}>
                      {item.display_name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className={searchStyle.conditionItem}>
              <div
                className={`${searchStyle.itemLabel} ${searchStyle.conditionLabel}`}
              >
                {t('monitor.filter')}
              </div>
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
                          {labels.map((item) => (
                            <Option value={item} key={item}>
                              {item}
                            </Option>
                          ))}
                        </Select>
                        <Select
                          className="w-[90px]"
                          placeholder={t('monitor.term')}
                          value={conditionItem.condition}
                          onChange={(val) => handleConditionChange(val, index)}
                        >
                          {CONDITION_LIST.map((item: ListItem) => (
                            <Option value={item.id} key={item.id}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                        <Input
                          className="w-[150px]"
                          placeholder={t('monitor.value')}
                          value={conditionItem.value}
                          onChange={(e) => handleValueChange(e, index)}
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
                    className="mt-[10px]"
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
            className="mb-[10px]"
            value={activeTab}
            options={[
              {
                label: (
                  <div className="flex items-center">
                    <Icon type="duijimianjitu" className="mr-[8px]" />
                    {t('monitor.search.area')}
                  </div>
                ),
                value: 'area',
              },
              {
                label: (
                  <div className="flex items-center">
                    <Icon type="tabulation" className="mr-[8px]" />
                    {t('monitor.search.table')}
                  </div>
                ),
                value: 'table',
              },
            ]}
            onChange={onTabChange}
          />
          {isArea ? (
            <div className={searchStyle.chartArea}>
              {!!metric && (
                <div className="text-[14px] mb-[10px]">
                  <span className="font-[600]">
                    {metrics.find((item) => item.name === metric)
                      ?.display_name || '--'}
                  </span>
                  <span className="text-[var(--color-text-3)] text-[12px]">
                    {`${
                      findUnitNameById(
                        metrics.find((item) => item.name === metric)?.unit
                      )
                        ? '（' +
                          findUnitNameById(
                            metrics.find((item) => item.name === metric)?.unit
                          ) +
                          '）'
                        : ''
                    }`}
                  </span>
                </div>
              )}
              <LineChart
                metric={metrics.find((item) => item.name === metric)}
                data={processData(chartData)}
                unit={unit}
                onXRangeChange={onXRangeChange}
              />
            </div>
          ) : (
            <CustomTable
              scroll={{ y: 'calc(100vh - 440px)' }}
              columns={columns}
              dataSource={tableData}
              pagination={false}
              rowKey="index"
            />
          )}
        </div>
      </Spin>
    </div>
  );
};

export default Search;
