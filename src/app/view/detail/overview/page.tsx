'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Spin, Tooltip } from 'antd';
import TimeSelector from '@/components/time-selector';
import LineChart from '@/components/charts/lineChart';
import BarChart from '@/components/charts/barChart';
import CustomTable from '@/components/custom-table';
import GuageChart from '@/components/charts/guageChart';
import SingleValue from '@/components/charts/singleValue';
import useApiClient from '@/utils/request';
import { MetricItem, ChartDataItem, SearchParams } from '@/types/monitor';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ChartData } from '@/types';
import { useTranslation } from '@/utils/i18n';
import { deepClone, findUnitNameById, calculateMetrics } from '@/utils/common';
import { useSearchParams } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { INDEX_CONFIG } from '@/constants/monitor';

const Overview = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const monitorObject: React.Key = searchParams.get('monitorObjId') || '';
  const instId: React.Key = searchParams.get('instance_id') || '';
  const groupName: string = searchParams.get('name') || '';
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [metricId, setMetricId] = useState<number>();
  const beginTime: number = dayjs().subtract(15, 'minute').valueOf();
  const lastTime: number = dayjs().valueOf();
  const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
  const [times, setTimes] = useState<[Dayjs, Dayjs] | null>(null);
  const [frequence, setFrequence] = useState<number>(0);
  const [metricData, setMetricData] = useState<MetricItem[]>([]);
  const [timeRangeValue, setTimeRangeValue] = useState<number>(15);

  useEffect(() => {
    clearTimer();
    if (frequence > 0) {
      timerRef.current = setInterval(() => {
        handleSearch('timer');
      }, frequence);
    }
    return () => clearTimer();
  }, [frequence, timeRange, metricId]);

  useEffect(() => {
    handleSearch('refresh');
  }, [timeRange]);

  useEffect(() => {
    if (isLoading) return;
    getInitData(instId);
  }, [isLoading]);

  const getInitData = async (id: string) => {
    const getMetrics = get('/api/metrics/', {
      params: {
        monitor_object_id: +monitorObject,
      },
    });
    const indexList =
      INDEX_CONFIG.find((item) => item.name === groupName)?.dashboardDisplay ||
      [];
    setLoading(true);
    try {
      getMetrics.then((res) => {
        const responseData = res
          .filter((item: MetricItem) =>
            indexList.find((indexItem) => indexItem.indexId === item.name)
          )
          .map((item: MetricItem) => {
            const target = indexList.find(
              (indexItem) => indexItem.indexId === item.name
            );
            if (target) {
              Object.assign(item, target);
            }
            return item;
          });
        const metricData = responseData.map((metric: MetricItem) => ({
          ...metric,
          viewData: [],
        }));
        setMetricData(metricData);
        fetchViewData(metricData, id);
      });
    } catch (error) {
      setLoading(false);
    }
  };

  const getParams = (query: string, id: string) => {
    const params: SearchParams = {
      query: query.replace(/__\$labels__/g, `instance_id="${id}"`),
    };
    const startTime = timeRange.at(0);
    const endTime = timeRange.at(1);
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

  const processData = (
    data: ChartDataItem[],
    metricItem: MetricItem
  ): ChartData[] => {
    const result: any[] = [];
    const target = metricItem?.dimensions || [];
    data.forEach((item, index: number) => {
      item.values.forEach(([timestamp, value]: [number, string]) => {
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
            title: metricItem.display_name,
            [`value${index + 1}`]: parseFloat(value),
            details,
          });
        }
      });
    });
    return result;
  };

  const fetchViewData = async (data: MetricItem[], id: string) => {
    setLoading(true);
    const requestQueue = data.map((item: MetricItem) =>
      get(`/api/metrics_instance/query_range/`, {
        params: getParams(item?.query || '', id),
      }).then((response) => ({ id: item.id, data: response.data.result || [] }))
    );
    try {
      const results = await Promise.all(requestQueue);
      results.forEach((result) => {
        const metricItem = data.find((item) => item.id === result.id);
        if (metricItem) {
          metricItem.viewData = processData(result.data || [], metricItem);
        }
      });
    } catch (error) {
      console.error('Error fetching view data:', error);
    } finally {
      const _data = deepClone(data);
      setMetricData(_data);
      setLoading(false);
    }
  };

  const onTimeChange = (val: number[]) => {
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
    handleSearch('refresh');
  };

  const handleSearch = (type?: string) => {
    const _metricData = deepClone(metricData);
    setMetricData(_metricData);
    fetchViewData(_metricData, instId);
  };

  const onXRangeChange = (arr: [Dayjs, Dayjs]) => {
    setTimes(arr);
    setTimeRangeValue(0);
    const _times = arr.map((item) => dayjs(item).valueOf());
    setTimeRange(_times);
  };

  const getGuageLabel = (arr: ChartDataItem[]) => {
    return (
      (arr[0]?.details?.value1 || [])
        .filter((item: ChartDataItem) => item.name !== 'instance_name')
        .map((item: ChartDataItem) => item.value)
        .join('-') || ''
    );
  };

  const getTableData = (data: ChartDataItem[]) => {
    if (data.length === 0) return [];
    const latestData = data[data.length - 1];
    const { details } = latestData;
    const createName = (details: any[]) => {
      return details
        .filter((item) => item.name !== 'instance_name')
        .map((detail) => `${detail.label}${detail.value}`)
        .join('-');
    };
    const tableData = [];
    for (const key in latestData) {
      if (key.startsWith('value')) {
        const detailKey = key;
        if (details[detailKey]) {
          tableData.push({
            Device: createName(details[detailKey]),
            Value: latestData[detailKey].toFixed(2),
            id: detailKey,
          });
        }
      }
    }
    return tableData;
  };

  const renderChart = (metricItem: any) => {
    switch (metricItem.displayType) {
      case 'barChart':
        return (
          <div className="w-[500px] h-full">
            <BarChart
              data={metricItem.viewData || []}
              unit={metricItem.unit}
              showDimensionFilter
              onXRangeChange={onXRangeChange}
            />
          </div>
        );
      case 'dashboard':
        return (
          <div className="w-[200px]">
            <GuageChart
              value={
                calculateMetrics(metricItem.viewData || []).latestValue || 0
              }
              max={20}
              segments={metricItem.segments}
              label={getGuageLabel(metricItem.viewData || [])}
            />
          </div>
        );
      case 'single':
        return (
          <div className="w-[100px]">
            <SingleValue
              fontSize={30}
              value={
                calculateMetrics(metricItem.viewData || []).latestValue || '--'
              }
              label={getGuageLabel(metricItem.viewData || [])}
            />
          </div>
        );
      case 'table':
        return (
          <div className="w-[300px]">
            <CustomTable
              pagination={false}
              dataSource={getTableData(metricItem.viewData || [])}
              columns={metricItem.displayDimension.map((item: any) => ({
                title: item,
                dataIndex: item,
                key: item,
              }))}
              scroll={{ y: 130 }}
              rowKey="id"
            />
          </div>
        );
      default:
        return (
          <div className="w-[500px] h-full">
            <LineChart
              data={metricItem.viewData || []}
              unit={metricItem.unit}
              showDimensionFilter
              onXRangeChange={onXRangeChange}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-[var(--color-bg-1)] p-[20px]">
      <div className="flex justify-end mb-[15px]">
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
      <div className="h-[calc(100vh-180px)] overflow-y-auto">
        <Spin spinning={loading}>
          <div className="flex flex-wrap">
            {metricData
              .sort((a: any, b: any) => a.sortIndex - b.sortIndex)
              .map((metricItem: MetricItem) => (
                <div
                  key={metricItem.id}
                  className="mb-[20px] mr-[20px] p-[10px] shadow"
                >
                  <div className="flex justify-between items-center mb-[10px]">
                    <span className="text-[14px]">
                      <span className="font-[600] mr-[2px]">
                        {metricItem.display_name}
                      </span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {findUnitNameById(metricItem.unit)
                          ? `（${findUnitNameById(metricItem.unit)}）`
                          : ''}
                      </span>
                      <Tooltip
                        placement="topLeft"
                        title={metricItem.description as string}
                      >
                        <QuestionCircleOutlined
                          className="text-[12px] relative cursor-pointer text-[var(--color-text-2)]"
                          style={{ top: '-6px' }}
                        />
                      </Tooltip>
                    </span>
                  </div>
                  <div className="h-[180px] flex justify-center items-center">
                    {renderChart(metricItem)}
                  </div>
                </div>
              ))}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default Overview;
