'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Button, Spin } from 'antd';
import { BellOutlined, SearchOutlined } from '@ant-design/icons';
import OperateModal from '@/components/operate-modal';
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
  const [searhText, setSearhText] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string[]>([]);
  const [frequence, setFrequence] = useState<number>(0);
  const [metricData, setMetricData] = useState<IndexViewItem[]>([]);
  const [instId, setInstId] = useState<string>('');

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
    if (groupVisible) {
      console.log(123);
    }
  }, [groupVisible]);

  const handleCancel = () => {
    setGroupVisible(false);
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
            isExpanded: !index,
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
          setMetricData(groupData);
          fetchViewData(groupData, 0, id);
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

  const fetchViewData = async (
    data: IndexViewItem[],
    index: number,
    id: string
  ) => {
    const metricList = data[index]?.child || [];
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
          metricItem.viewData = processData(result.data || []);
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
    console.log(123);
  };

  const handleSearhTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearhText(e.target.value);
  };

  const toggleGroup = (expanded: boolean, index: number) => {
    if (expanded) {
      const _metricData = deepClone(metricData);
      _metricData.forEach((item: IndexViewItem) => {
        item.isExpanded = false;
        item.isLoading = false;
      });
      _metricData[index].isExpanded = true;
      _metricData[index].isLoading = true;
      setMetricData(_metricData);
      fetchViewData(_metricData, index, instId);
    }
  };

  return (
    <div>
      <OperateModal
        width={900}
        title={title}
        visible={groupVisible}
        onCancel={handleCancel}
        footer={
          <div>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
          </div>
        }
      >
        <div className="flex justify-between mb-[15px]">
          <Input
            className="w-[250px]"
            placeholder={t('common.searchPlaceHolder')}
            value={searhText}
            onChange={handleSearhTextChange}
          ></Input>
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
            {metricData.map((metricItem, index) => (
              <Spin
                className="w-full"
                key={metricItem.id}
                spinning={metricItem.isLoading}
              >
                <Collapse
                  className="mb-[10px]"
                  title={metricItem.name || ''}
                  isOpen={!!metricItem.isExpanded}
                  onToggle={(expanded) => toggleGroup(expanded, index)}
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
                          <LineChart data={item.viewData || []} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </Spin>
            ))}
          </Spin>
        </div>
      </OperateModal>
    </div>
  );
});
ViewModal.displayName = 'ViewModal';
export default ViewModal;
