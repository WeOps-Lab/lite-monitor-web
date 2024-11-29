'use client';
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { ObectItem, AlertProps, MetricItem } from '@/types/monitor';
import useApiClient from '@/utils/request';

const Template: React.FC<AlertProps> = ({ objects }) => {
  const { t } = useTranslation();
  const { get, isLoading } = useApiClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    if (isLoading) return;
    // getInitData();
  }, [isLoading]);

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
    console.log(data);
  };

  return (
    <div className="w-full">
      <Spin spinning={loading}>模板</Spin>
    </div>
  );
};
export default Template;
