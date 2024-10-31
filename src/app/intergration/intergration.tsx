'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Input, Button, Segmented, Tag } from 'antd';
import useApiClient from '@/utils/request';
import intergrationStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import { deepClone } from '@/utils/common';
import { useRouter } from 'next/navigation';
interface ListItem {
  label: string;
  value: string;
}

const Intergration = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const responseData = [
    {
      id: 1,
      group_id: 'HOST',
      name: 'OS',
      des: 'Used for monitoring data collection of Windows operating system, including indicators such as CPU, memory,disk, etc',
      icon: 'yuzhiguanli',
    },
    {
      id: 2,
      group_id: 'HOST',
      name: 'OS',
      des: 'Used for monitoring data collection of Windows operating system, including indicators such as CPU, memory,disk, etc',
      icon: 'yuzhiguanli',
    },
    {
      id: 3,
      group_id: 'HOST',
      name: 'OS',
      des: 'Used for monitoring data collection of Windows operating system, including indicators such as CPU, memory,disk, etc',
      icon: 'yuzhiguanli',
    },
    {
      id: 4,
      group_id: 'HOST',
      name: 'DB',
      des: 'Used for monitoring data collection of Windows operating system, including indicators such as CPU, memory,disk, etc',
      icon: 'yuzhiguanli',
    },
    {
      id: 5,
      group_id: 'HOST',
      name: 'DB',
      des: 'Used for monitoring data collection of Windows operating system, including indicators such as CPU, memory,disk, etc',
      icon: 'yuzhiguanli',
    },
  ];

  useEffect(() => {
    if (activeTab) {
      const data = deepClone(responseData);
      const activeData = data.filter((item: any) => item.name === activeTab);
      setApps(activeTab === 'All' ? data : activeData);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const getInitData = () => {
    setItems([
      {
        label: 'All (5)',
        value: 'All',
      },
      {
        label: 'OS (3)',
        value: 'OS',
      },
      {
        label: 'DB (2)',
        value: 'DB',
      },
    ]);
    setApps(responseData);
    setActiveTab('All');
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    getInitData();
  };

  const onTxtClear = () => {
    getInitData();
  };

  const linkToDetial = (app: any) => {
    const params = new URLSearchParams(app);
    const targetUrl = `/intergration/detail?${params.toString()}`;
    router.push(targetUrl);
  };

  return (
    <div className={intergrationStyle.intergration}>
      <Input
        className="mb-[20px] w-[400px]"
        placeholder={t('common.searchPlaceHolder')}
        value={searchText}
        allowClear
        onChange={onSearchTxtChange}
        onPressEnter={onTxtPressEnter}
        onClear={onTxtClear}
      />
      <Spin spinning={pageLoading}>
        <Segmented
          className="mb-[20px]"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
        <div className="flex flex-wrap w-full">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`w-full sm:w-1/4 p-2 min-w-[200px] ${intergrationStyle.appItem}`}
            >
              <div className="border shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out rounded-lg p-4 relative cursor-pointer group">
                <div className="flex items-center space-x-4 my-2">
                  <Icon type={app.icon} className="text-6xl" />
                  <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold m-0">{app.group_id}</h2>
                    <Tag className="mt-[4px]">{app.name}</Tag>
                  </div>
                </div>
                <p
                  className={`mb-[15px] text-[var(--color-text-3)] text-[13px] ${intergrationStyle.lineClamp3}`}
                >
                  {app.des}
                </p>
                <div
                  className={`w-full h-[32px] flex justify-center items-end ${intergrationStyle.setting}`}
                >
                  <Button
                    type="primary"
                    className="w-full rounded-md transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      linkToDetial(app);
                    }}
                  >
                    <Icon type="shezhi" /> {t('common.setting')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Spin>
    </div>
  );
};
export default Intergration;
