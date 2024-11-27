'use client';
import React, { useState } from 'react';
import { Segmented } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { SegmentedItem } from '@/types';
import Alert from './alert/index';

const Event = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('alert');
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

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  return (
    <div className="w-full">
      <Segmented
        className="mb-[20px] custom-tabs"
        value={activeTab}
        options={items}
        onChange={onTabChange}
      />
      {activeTab === 'alert' ? <Alert /> : <div>123</div>}
    </div>
  );
};
export default Event;
