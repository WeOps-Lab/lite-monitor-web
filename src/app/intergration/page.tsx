'use client';
import React, { useState } from 'react';
import { Spin, Segmented } from 'antd';
import searchStyle from './index.module.less';
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
    <div className={searchStyle.search} style={{ width: '100%' }}>
      <Spin spinning={pageLoading}>
        <div className={searchStyle.chart}>
          <Segmented
            className="mb-[20px]"
            value={activeTab}
            options={[
              {
                label: t('monitor.intergration'),
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
