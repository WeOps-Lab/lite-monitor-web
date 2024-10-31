'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Segmented, Progress } from 'antd';
import useApiClient from '@/utils/request';
import searchStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import { ColumnItem } from '@/types';
import Intergration from './intergration';
import Asset from './asset';

const IntergrationAsset = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('intergration');
  const [loading, setLoading] = useState<boolean>(false);
  const isIntergration: boolean = activeTab === 'intergration';
  //   useEffect(() => {
  //     if (isLoading) return;
  //     getInitData();
  //   }, [isLoading]);

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
