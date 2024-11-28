'use client';
import React, { useState, useEffect } from 'react';
import { Segmented, Spin } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { SegmentedItem } from '@/types';
import Alert from './alert/index';
import { ObectItem, MetricItem } from '@/types/monitor';
import useApiClient from '@/utils/request';

const Event = () => {
  const { t } = useTranslation();
  const { get, isLoading } = useApiClient();
  const [activeTab, setActiveTab] = useState<string>('alert');
  const [loading, setLoading] = useState<boolean>(false);
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [items, setItems] = useState<SegmentedItem[]>([
    {
      label: t('monitor.alert'),
      value: 'alert',
    },
    {
      label: t('monitor.strategy'),
      value: 'strategy',
    },
    {
      label: t('monitor.template'),
      value: 'template',
    },
  ]);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const getInitData = () => {
    setLoading(true);
    Promise.all([getMetrics(), getObjects()]).finally(() => {
      setLoading(false);
    });
  };

  const getMetrics = async () => {
    const data = await get(`/api/metrics/`);
    setMetrics(data);
  };

  const getObjects = async () => {
    const data: ObectItem[] = await get('/api/monitor_object/');
    setObjects(data);
  };

  return (
    <div className="w-full">
      <Spin spinning={loading}>
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
        {activeTab === 'alert' ? (
          <Alert objects={objects} metrics={metrics} />
        ) : (
          <div>123</div>
        )}
      </Spin>
    </div>
  );
};
export default Event;
