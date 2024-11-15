'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Button, Spin, Select } from 'antd';
import { BellOutlined, SearchOutlined } from '@ant-design/icons';
import OperateDrawer from '@/components/operate-drawer';
import TimeSelector from '@/components/time-selector';
import LineChart from '@/components/line-chart';
import Collapse from '@/components/collapse';
import useApiClient from '@/utils/request';
import { ModalRef } from '@/types';
import { MetricItem, GroupInfo, IndexViewItem } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/utils/common';

interface ModalProps {
  monitorObject: React.Key;
}

interface SearchParams {
  end?: number;
  start?: number;
  step?: number;
  query: string;
}

const ViewModal = forwardRef<ModalRef, ModalProps>(({ monitorObject }, ref) => {
  const { get } = useApiClient();
  const { t } = useTranslation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [groupVisible, setGroupVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [metricId, setMetricId] = useState<number>();
  const [timeRange, setTimeRange] = useState<string[]>([]);
  const [frequence, setFrequence] = useState<number>(0);
  const [metricData, setMetricData] = useState<IndexViewItem[]>([]);
  const [originMetricData, setOriginMetricData] = useState<IndexViewItem[]>([]);
  const [instId, setInstId] = useState<string>('');
  const [expandId, setExpandId] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    showModal: ({ title, form }) => {
      // 开启弹窗的交互
      setGroupVisible(true);
      setTitle(title);
      setInstId(form.instance_id);
      getInitData(form.instance_id);
    },
  }));

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

  const handleCancel = () => {
    setGroupVisible(false);
    clearTimer();
  };

  const getInitData = async (id: string) => {
    const getGroupList = get(`/api/metrics_group/`);
    const getMetrics = get('/api/metrics/', {
      params: {
        monitor_object_id: monitorObject,
      },
    });
    setLoading(true);
    try {
      Promise.all([getGroupList, getMetrics])
        .then((res) => {
          const groupData = res[0].map((item: GroupInfo, index: number) => ({
            ...item,
            isLoading: !index,
            child: [],
          }));
          const metricData = res[1];
          metricData.forEach((metric: MetricItem) => {
            const target = groupData.find(
              (item: GroupInfo) => item.id === metric.metric_group
            );
            if (target) {
              target.child.push({
                ...metric,
                viewData: [],
              });
            }
          });
          setExpandId(groupData[0]?.id || 0);
          setMetricData(groupData);
          setOriginMetricData(groupData);
          fetchViewData(groupData, groupData[0]?.id || 0, id);
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
    if (startTime && endTime) {
      params.start = new Date(startTime).getTime();
      params.end = new Date(endTime).getTime();
      params.step = Math.ceil((params.end / 1000 - params.start / 1000) / 360);
    }
    return params;
  };

  const processData = (data: any, metricItem: MetricItem) => {
    const result: any[] = [];
    const target = metricItem?.dimensions || [];
    data.forEach((item: any, index: number) => {
      item.values.forEach(([timestamp, value]: [number, string]) => {
        const time = new Date(timestamp * 1000).toLocaleString();
        const existing = result.find((entry) => entry.time === time);
        if (existing) {
          existing[`value${index + 1}`] = parseFloat(value);
        } else {
          result.push({
            time,
            title: metricItem.name,
            dimensions: Object.entries(item.metric)
              .map(([key, value]) => ({
                name: key,
                label:
                  key === 'instance_name'
                    ? 'Instance Name'
                    : target.find((sec) => sec.name === key)?.description ||
                      key,
                value: value,
              }))
              .filter(
                (item) =>
                  item.name === 'instance_name' ||
                  target.find((tex) => tex.name === item.name)
              ),
            [`value${index + 1}`]: parseFloat(value),
          });
        }
      });
    });
    return result;
  };

  const fetchViewData = async (
    data: IndexViewItem[],
    groupId: number,
    id: string
  ) => {
    const metricList = data.find((item) => item.id === groupId)?.child || [];
    const requestQueue = metricList.map((item) =>
      get(`/api/metrics_instance/query_range/`, {
        params: getParams(item.query, id),
      }).then((response) => ({ id: item.id, data: response.data.result || [] }))
    );
    try {
      const results = await Promise.all(requestQueue);
      results.forEach((result) => {
        const metricItem = metricList.find((item) => item.id === result.id);
        if (metricItem) {
          metricItem.viewData = processData(result.data || [], metricItem);
        }
      });
    } catch (error) {
      console.error('Error fetching view data:', error);
    } finally {
      const _data = deepClone(data).map((item: IndexViewItem) => ({
        ...item,
        isLoading: false,
      }));
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
    const target = _metricData.find(
      (item: IndexViewItem) => item.id === expandId
    );
    if (type === 'refresh' && target) {
      target.isLoading = true;
    }
    setMetricData(_metricData);
    fetchViewData(_metricData, expandId, instId);
  };

  const handleMetricIdChange = (val: number) => {
    setMetricId(val);
    if (val) {
      const filteredData = originMetricData
        .map((group) => ({
          ...group,
          isLoading: false,
          child: (group?.child || []).filter((item) => item.id === val),
        }))
        .filter((item) => item.child?.find((tex) => tex.id === val));
      const target = filteredData.find((item) =>
        item.child?.find((tex) => tex.id === val)
      );
      if (target) {
        target.isLoading = true;
        const _groupId = target?.id || 0;
        setExpandId(_groupId);
        setMetricData(filteredData);
        fetchViewData(filteredData, _groupId, instId);
      }
    } else {
      getInitData(instId);
    }
  };

  const toggleGroup = (expanded: boolean, groupId: number) => {
    if (expanded) {
      const _metricData = deepClone(metricData);
      _metricData.forEach((item: IndexViewItem) => {
        item.isLoading = false;
      });
      const targetIndex = _metricData.findIndex(
        (item: IndexViewItem) => item.id === groupId
      );
      if (targetIndex !== -1) {
        _metricData[targetIndex].isLoading = true;
      }
      setExpandId(groupId);
      setMetricData(_metricData);
      fetchViewData(_metricData, groupId, instId);
    }
  };

  return (
    <div>
      <OperateDrawer
        width={900}
        title={title}
        visible={groupVisible}
        onClose={handleCancel}
        footer={
          <div>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
          </div>
        }
      >
        <div className="flex justify-between mb-[15px]">
          <Select
            className="w-[250px]"
            placeholder={t('common.searchPlaceHolder')}
            value={metricId}
            allowClear
            showSearch
            options={originMetricData.map((item) => ({
              label: item.name,
              title: item.name,
              options: (item.child || []).map((tex) => ({
                label: tex.name,
                value: tex.id,
              })),
            }))}
            onChange={handleMetricIdChange}
          ></Select>
          <TimeSelector
            onChange={(value, dateString) => {
              onTimeChange(dateString);
            }}
            onFrequenceChange={onFrequenceChange}
            onRefresh={onRefresh}
          />
        </div>
        <div className="groupList">
          <Spin spinning={loading}>
            {metricData.map((metricItem) => (
              <Spin
                className="w-full"
                key={metricItem.id}
                spinning={metricItem.isLoading}
              >
                <Collapse
                  className="mb-[10px]"
                  title={metricItem.name || ''}
                  isOpen={metricItem.id === expandId}
                  onToggle={(expanded) => toggleGroup(expanded, metricItem.id)}
                >
                  <div className="flex flex-wrap justify-between">
                    {(metricItem.child || []).map((item) => (
                      <div
                        key={item.id}
                        className="w-[49%] border border-[var(--color-border-1)] p-[10px] mb-[10px]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-[600] text-[14px]">
                            {item.name}
                          </span>
                          <div className="text-[var(--color-text-3)]">
                            <SearchOutlined className="cursor-pointer" />
                            <BellOutlined className="ml-[6px] cursor-pointer" />
                          </div>
                        </div>
                        <div className="h-[100px] mt-[10px]">
                          <LineChart
                            data={item.viewData || []}
                            unit={item.unit}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </Spin>
            ))}
          </Spin>
        </div>
      </OperateDrawer>
    </div>
  );
});
ViewModal.displayName = 'ViewModal';
export default ViewModal;
