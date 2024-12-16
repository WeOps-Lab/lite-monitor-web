'use client';
import React, { useState } from 'react';
import { Spin, Segmented } from 'antd';
import { useTranslation } from '@/utils/i18n';
import Intergration from './intergration';
import Asset from './asset';

const IntergrationAsset = () => {
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('intergration');
  const isIntergration: boolean = activeTab === 'intergration';

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  return (
    <div style={{ width: '100%' }}>
      <Spin spinning={pageLoading}>
        <div>
          <Segmented
            className="mb-[20px]"
            value={activeTab}
            options={[
              {
                label: t('monitor.intergrations.intergration'),
                value: 'intergration',
              },
              {
                label: t('monitor.asset'),
                value: 'asset',
              },
            ]}
            onChange={onTabChange}
          />
          {isIntergration ? <Intergration /> : <Asset />}
        </div>
      </Spin>
    </div>
  );
};
export default IntergrationAsset;
