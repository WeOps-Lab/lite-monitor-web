'use client';
import React, { useEffect, useState } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Button, Switch, Modal, message } from 'antd';
import useApiClient from '@/utils/request';
import metricStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/utils/common';
import CustomTable from '@/components/custom-table';
import { ColumnItem } from '@/types';
import Collapse from '@/components/collapse';
const { confirm } = Modal;
interface ListItem {
  id: string;
  name: string;
  child: any[];
}

const Configure = () => {
  const { del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string>('');
  const [metricData, setMetricData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const responseData = [
    {
      id: 'group1',
      name: 'Group1',
      child: [
        {
          id: 1,
          dimension: 'Disk',
          name: 'CPU usage',
          descripition: 'Used for monitoring data',
          type: 'float',
          unit: 'percent',
          keyMetric: true,
        },
      ],
    },
    {
      id: 'group2',
      name: 'Group2',
      child: [
        {
          id: 2,
          dimension: 'Disk1',
          name: 'CPU usage',
          descripition: 'Used for monitoring data',
          type: 'float',
          unit: 'percent',
          keyMetric: false,
        },
      ],
    },
  ];

  const columns: ColumnItem[] = [
    {
      title: t('common.id'),
      dataIndex: 'id',
      key: 'id',
      ellipsis: {
        showTitle: true,
      },
    },
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('monitor.dimension'),
      dataIndex: 'dimension',
      key: 'dimension',
    },
    {
      title: t('common.type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('common.unit'),
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: t('common.descripition'),
      dataIndex: 'descripition',
      key: 'descripition',
    },
    {
      title: t('monitor.keyMetric'),
      dataIndex: 'keyMetric',
      key: 'keyMetric',
      render: (_, record) => (
        <Switch
          size="small"
          onChange={handleKeyMetricChange}
          value={record.keyMetric}
        />
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      render: (_, record) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => showMetricModal(record)}
          >
            {t('common.edit')}
          </Button>
          <Button type="link" onClick={() => showDeleteConfirm(record)}>
            {t('common.delete')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const handleKeyMetricChange = () => {
    console.log(123);
  };

  const showDeleteConfirm = (row: any) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/instance/${row._id}/`);
            message.success(t('common.successfullyDeleted'));
            getInitData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const showGroupDeleteConfirm = (row: any) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/instance/${row._id}/`);
            message.success(t('common.successfullyDeleted'));
            getInitData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const showMetricModal = (row: any) => {
    console.log(row);
  };

  const getInitData = () => {
    const data = deepClone(responseData);
    setMetricData(data);
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

  return (
    <div className={metricStyle.metric}>
      <p className="mb-[10px] text-[var(--color-text-2)]">
        {t('monitor.metricTitle')}
      </p>
      <div className="flex items-center justify-between mb-[15px]">
        <Input
          className="w-[400px]"
          placeholder={t('common.searchPlaceHolder')}
          value={searchText}
          allowClear
          onChange={onSearchTxtChange}
          onPressEnter={onTxtPressEnter}
          onClear={onTxtClear}
        />
        <div>
          <Button type="primary" className="mr-[8px]">
            {t('monitor.addGroup')}
          </Button>
          <Button type="primary"> {t('monitor.addMetric')}</Button>
        </div>
      </div>
      {metricData.map((metricItem, index) => (
        <Collapse
          className="mb-[10px]"
          key={metricItem.id}
          title={metricItem.name || ''}
          isOpen={!index}
          icon={
            <div>
              <Button type="link" size="small" icon={<EditOutlined />}></Button>
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => showGroupDeleteConfirm(metricItem)}
              ></Button>
            </div>
          }
        >
          <CustomTable
            pagination={false}
            dataSource={metricItem.child || []}
            loading={loading}
            columns={columns}
            scroll={{ y: 300 }}
            rowKey="id"
          />
        </Collapse>
      ))}
    </div>
  );
};
export default Configure;
