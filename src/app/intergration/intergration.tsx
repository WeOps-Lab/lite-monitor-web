'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Input, Button, Segmented, Tag } from 'antd';
import useApiClient from '@/utils/request';
import intergrationStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import { deepClone } from '@/utils/common';
import { useRouter } from 'next/navigation';
import { IntergrationItem, ObectItem } from '@/types/monitor';

const Intergration = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [apps, setApps] = useState<ObectItem[]>([]);

  useEffect(() => {
    if (activeTab) {
      setApps(items.find((item) => item.value === activeTab)?.list || []);
    }
  }, [activeTab, items]);

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      const data = await get(`/api/monitor_object/`, {
        params: {
          name: text || '',
        },
      });
      const _items = getAppsByType(data);
      setItems(_items);
      setActiveTab('All');
    } finally {
      setPageLoading(false);
    }
  };

  const getAppsByType = (data: ObectItem[]): IntergrationItem[] => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {
          label: item.type,
          value: item.type,
          list: [],
        };
      }
      acc[item.type].list.push(item);
      acc[item.type].label = `${item.type}(${acc[item.type].list.length})`;
      return acc;
    }, {} as Record<string, IntergrationItem>);
    return [
      {
        label: `All(${data.length})`,
        value: 'All',
        list: data,
      },
      ...Object.values(groupedData),
    ];
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    getObjects(searchText);
  };

  const onTxtClear = () => {
    setSearchText('');
    getObjects('');
  };

  const linkToDetial = (app: ObectItem) => {
    const row = deepClone(app);
    const params = new URLSearchParams(row);
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
          className="mb-[20px] custom-tabs"
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
                  <Icon type={app.name} className="text-6xl" />
                  <div>
                    <h2 className="text-xl font-bold m-0">{app.type}</h2>
                    <Tag className="mt-[4px]">{app.name}</Tag>
                  </div>
                </div>
                <p
                  className={`mb-[15px] text-[var(--color-text-3)] text-[13px] ${intergrationStyle.lineClamp3}`}
                >
                  {app.description}
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
