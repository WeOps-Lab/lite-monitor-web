'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Input, Button, Segmented, Tag, message } from 'antd';
import useApiClient from '@/utils/request';
import intergrationStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import { deepClone } from '@/utils/common';
import { useRouter } from 'next/navigation';
import { IntergrationItem, ObectItem, PluginItem } from '@/types/monitor';
import { OBJECT_ICON_MAP } from '@/constants/monitor';
import { ModalRef } from '@/types';
import ImportModal from './importModal';
import axios from 'axios';
import { useAuth } from '@/context/auth';

const Intergration = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const router = useRouter();
  const importRef = useRef<ModalRef>(null);
  const authContext = useAuth();
  const token = authContext?.token || null;
  const tokenRef = useRef(token);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [originObjects, setOriginObjects] = useState<ObectItem[]>([]);
  const [apps, setApps] = useState<ObectItem[]>([]);
  const [exportDisabled, setExportDisabled] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<ObectItem | null>(null);

  useEffect(() => {
    if (activeTab) {
      setApps(items.find((item) => item.value === activeTab)?.list || []);
    }
  }, [activeTab, items]);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const getInitData = async () => {
    setPageLoading(true);
    try {
      const getObjects = get('/api/monitor_object/');
      const getPlugins = get('/api/monitor_plugin/');
      Promise.all([getObjects, getPlugins])
        .then((res) => {
          setOriginObjects(res[0] || []);
          const _items = getAppsByType(res[0], res[1]);
          setItems(_items);
          setActiveTab('All');
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch {
      setPageLoading(false);
    }
  };

  const exportMetric = async () => {
    if (!selectedApp) return;
    try {
      setExportLoading(true);
      const response = await axios({
        url: `/reqApi/api/monitor_plugin/export/${selectedApp.plugin_id}/`, // 替换为你的导出数据的API端点
        method: 'GET',
        responseType: 'blob', // 确保响应类型为blob
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      const text = await response.data.text();
      const json = JSON.parse(text);
      // 将data对象转换为JSON字符串并创建Blob对象
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedApp.plugin_name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(t('common.successfullyExported'));
    } catch (error) {
      message.error(error as string);
    } finally {
      setExportLoading(false);
    }
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      const data = await get(`/api/monitor_plugin/`, {
        params: {
          name: text || '',
        },
      });
      const _items = getAppsByType(originObjects, data);
      setItems(_items);
      setActiveTab('All');
    } finally {
      setPageLoading(false);
    }
  };

  const getAppsByType = (
    data: ObectItem[],
    plugins: PluginItem[]
  ): IntergrationItem[] => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {
          label: item.type,
          value: item.type,
          list: [],
        };
      }
      plugins.forEach((plugin) => {
        if ((plugin.monitor_object || []).includes(item.id)) {
          acc[item.type].list.push({
            ...item,
            plugin_name: plugin?.name,
            plugin_id: plugin?.id,
            plugin_description: plugin?.description,
          });
        }
      });
      acc[item.type].label = `${item.type}(${acc[item.type].list.length})`;
      return acc;
    }, {} as Record<string, IntergrationItem>);
    const _list = Object.values(groupedData);
    const objectList = _list.reduce((pre, cur: any) => {
      return pre.concat(cur.list);
    }, []);
    return [
      {
        label: `All(${objectList.length})`,
        value: 'All',
        list: objectList,
      },
      ..._list,
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

  const openImportModal = () => {
    importRef.current?.showModal({
      title: t('monitor.importMetric'),
      type: 'add',
      form: {},
    });
  };

  const linkToDetial = (app: ObectItem) => {
    const row = deepClone(app);
    const params = new URLSearchParams(row);
    const targetUrl = `/intergration/detail?${params.toString()}`;
    router.push(targetUrl);
  };

  const onAppClick = (app: ObectItem) => {
    setSelectedApp(app);
    setExportDisabled(false); // Enable the export button
  };

  return (
    <div className={intergrationStyle.intergration}>
      <div className="flex">
        <Input
          className="mb-[20px] w-[400px]"
          placeholder={t('common.searchPlaceHolder')}
          value={searchText}
          allowClear
          onChange={onSearchTxtChange}
          onPressEnter={onTxtPressEnter}
          onClear={onTxtClear}
        />
        <div>
          <Button className="mx-[8px]" type="primary" onClick={openImportModal}>
            {t('monitor.importMetric')}
          </Button>
          <Button
            disabled={exportDisabled}
            loading={exportLoading}
            onClick={exportMetric}
          >
            {t('monitor.exportMetric')}
          </Button>
        </div>
      </div>
      <Spin spinning={pageLoading}>
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
        <div
          className={`flex flex-wrap w-full ${intergrationStyle.intergrationList}`}
        >
          {apps.map((app) => (
            <div
              key={app.plugin_id + app.name}
              className="w-full sm:w-1/4 p-2 min-w-[200px]"
              onClick={() => onAppClick(app)}
            >
              <div
                className={`bg-[var(--color-bg-1)] border shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out rounded-lg p-4 relative cursor-pointer group ${
                  (selectedApp?.plugin_id || '') + (selectedApp?.name || '') ===
                  app.plugin_id + app.name
                    ? 'border-2 border-blue-300'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-4 my-2">
                  <Icon type={OBJECT_ICON_MAP[app.name]} className="text-6xl" />
                  <div>
                    <h2 className="text-xl font-bold m-0">
                      {app.plugin_name || '--'}
                    </h2>
                    <Tag className="mt-[4px]">{app.name || '--'}</Tag>
                  </div>
                </div>
                <p
                  className={`mb-[15px] text-[var(--color-text-3)] text-[13px] ${intergrationStyle.lineClamp3}`}
                >
                  {app.plugin_description || '--'}
                </p>
                <div className="w-full h-[32px] flex justify-center items-end">
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
      <ImportModal ref={importRef} onSuccess={getObjects} />
    </div>
  );
};

export default Intergration;
