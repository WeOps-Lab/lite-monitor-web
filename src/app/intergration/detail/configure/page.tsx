'use client';
import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import useApiClient from '@/utils/request';
import configureStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/utils/common';
interface ListItem {
  label: string;
  value: string;
}

const Configure = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const responseData = [
    {
      id: 1,
      classficition_id: 'HOST',
      name: 'OS',
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

  return (
    <div className={configureStyle.configure}>
      <p className="mb-[10px] text-[var(--color-text-2)]">{t('monitor.configureTitle')}</p>
      <div
        dangerouslySetInnerHTML={{
          __html:
            '<h2 data-v-7419decd="">\n        一、工单信息\n    </h2> <div data-v-8aec1fda="" data-v-7419decd="" class="bk-node-info"><!----> <div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">标题: </p> <p data-v-0b376142="">\n                WeOps-自定义中间件bkpull（自定义bkpull实例）发生minio_audit_failed_messages告警\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">关联业务: </p> <p data-v-0b376142="">\n                DavisNguyen-12-4123\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">告警等级: </p> <p data-v-0b376142="">\n                提醒\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">影响范围: </p> <p data-v-0b376142="">\n                低\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">紧急程度: </p> <p data-v-0b376142="">\n                低\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">优先级: </p> <p data-v-0b376142="">\n                低\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">描述: </p> <p data-v-0b376142="">minio_audit_failed_messages &gt;= 0.0, 当前值0</p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">维度: </p> <p data-v-0b376142="">\n                采集配置ID(750)|业务ID(2)|target_id(sys_console_0)|_server(127.0.0.1:9000)\n            </p></div></div> <h2 data-v-7419decd="">\n        二、工作流\n    </h2> <div data-v-8aec1fda="" data-v-7419decd="" class="bk-node-info"><h3 data-v-8aec1fda="">1. 管理员审批</h3> <div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">审批意见: </p> <p data-v-0b376142="">\n                通过\n            </p></div><div data-v-0b376142="" data-v-8aec1fda="" class="bk-field-on-editor"><p data-v-0b376142="">备注: </p> <p data-v-0b376142="">sss</p></div></div><div data-v-8aec1fda="" data-v-7419decd="" class="bk-node-info"><h3 data-v-8aec1fda="">2. 结束</h3> </div>',
        }}
      ></div>
    </div>
  );
};
export default Configure;
