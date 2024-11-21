'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Spin } from 'antd';
import TimeSelector from '@/components/time-selector';
import LineChart from '@/components/charts/lineChart';
import BarChart from '@/components/charts/barChart';
import CustomTable from '@/components/custom-table';
import GuageChart from '@/components/charts/guageChart';
import SingleValue from '@/components/charts/singleValue';
import useApiClient from '@/utils/request';
import { MetricItem, IndexViewItem } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone, findUnitNameById } from '@/utils/common';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { INDEX_CONFIG } from '@/constants/monitor';

interface SearchParams {
  end?: number;
  start?: number;
  step?: number;
  query: string;
}

const ViewModal = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const monitorObject: React.Key = searchParams.get('monitorObjId') || '';
  const instId: React.Key = searchParams.get('instance_id') || '';
  const groupName: string = searchParams.get('name') || '';
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [metricId, setMetricId] = useState<number>();
  const currentTimestamp: number = dayjs().valueOf();
  const oneHourAgoTimestamp: number = dayjs().subtract(1, 'hour').valueOf();
  const beginTime: string = dayjs(oneHourAgoTimestamp).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  const lastTime: string = dayjs(currentTimestamp).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  const [timeRange, setTimeRange] = useState<string[]>([beginTime, lastTime]);
  const [times, setTimes] = useState<any>([
    dayjs(oneHourAgoTimestamp),
    dayjs(currentTimestamp),
  ]);
  const [frequence, setFrequence] = useState<number>(0);
  const [metricData, setMetricData] = useState<MetricItem[]>([]);

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
      getMetrics
        .then((res) => {
          const responseData = res
            .filter((item: any) =>
              indexList.find((indexItem) => indexItem.indexId === item.name)
            )
            .map((item: any) => {
              const target = indexList.find(
                (indexItem) => indexItem.indexId === item.name
              );
              if (target) {
                Object.assign(item, target);
              }
              return item;
            });
          console.log(responseData);
          const metricData = responseData.map((metric: MetricItem) => ({
            ...metric,
            viewData: [],
          }));
          setMetricData(metricData);
          fetchViewData(metricData, id);
        })
        .finally(() => {
          setLoading(false);
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
      params.start = new Date(startTime).getTime();
      params.end = new Date(endTime).getTime();
      params.step = Math.max(
        Math.ceil(
          (params.end / MAX_POINTS - params.start / MAX_POINTS) / DEFAULT_STEP
        ),
        1
      );
    }
    return params;
  };

  const processData = (data: any, metricItem: MetricItem) => {
    const result: any[] = [];
    const target = metricItem?.dimensions || [];
    data.forEach((item: any, index: number) => {
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
    const requestQueue = data.map((item: any) =>
      get(`/api/metrics_instance/query_range/`, {
        params: getParams(item.query, id),
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
    }
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
    handleSearch('refresh');
  };

  const handleSearch = (type?: string) => {
    const _metricData = deepClone(metricData);
    setMetricData(_metricData);
    fetchViewData(_metricData, instId);
  };

  const onXRangeChange = (arr: any) => {
    setTimes(arr);
    setTimeRange(arr.map((item: any) => new Date(item).getTime()));
  };

  const renderChart = (metricItem: any) => {
    switch (metricItem.displayType) {
      case 'lineChart':
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
          <div className="w-[200px] h-full">
            <GuageChart
              value={55}
              max={100}
              segments={[
                { value: 20, color: '#52C41A' }, // 绿色区域
                { value: 50, color: '#FFEC3D' }, // 黄色区域
                { value: 100, color: '#FF4D4F' }, // 红色区域
              ]}
              label="kafka-172.16.32.24"
            />
          </div>
        );
      case 'single':
        return (
          <div className="w-[100px]">
            <SingleValue value="单值" unit="%" label="wome1" />
          </div>
        );
      case 'table':
        return (
          <div className="w-[300px]">
            <CustomTable
              dataSource={[]}
              columns={metricItem.displayDimension.map((item: any) => ({
                title: item,
                dataIndex: item,
                key: item,
              }))}
              scroll={{ y: 300 }}
              rowKey="id"
            />
          </div>
        );
      default:
        return <div>unkown</div>;
    }
  };

  return (
    <div className="bg-[var(--color-bg-1)] p-[20px]">
      <div className="flex justify-end mb-[15px]">
        <TimeSelector
          onChange={(value, dateString) => {
            setTimes(value);
            onTimeChange(dateString);
          }}
          value={times}
          onFrequenceChange={onFrequenceChange}
          onRefresh={onRefresh}
        />
      </div>
      <div className="h-[calc(100vh-180px)] overflow-y-auto">
        <Spin spinning={loading}>
          <div className="flex flex-wrap">
            {metricData.map((metricItem: any) => (
              <div key={metricItem.id} className="mb-[20px] mr-[20px] p-[10px] shadow">
                <div className="flex justify-between items-center mb-[10px]">
                  <span className="text-[14px]">
                    <span className="font-[600]">
                      {metricItem.display_name}
                    </span>
                    <span className="text-[var(--color-text-3)] text-[12px]">
                      {findUnitNameById(metricItem.unit)
                        ? `（${findUnitNameById(metricItem.unit)}）`
                        : ''}
                    </span>
                  </span>
                </div>
                <div className="h-[200px]">{renderChart(metricItem)}</div>
              </div>
            ))}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default ViewModal;
