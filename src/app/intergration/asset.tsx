'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Select, Button, Progress } from 'antd';
import useApiClient from '@/utils/request';
import searchStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import { ColumnItem } from '@/types';
import { deepClone } from '@/utils/common';
import CustomTable from '@/components/custom-table';

const Asset = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('intergration');
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const columns: ColumnItem[] = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Value1',
      dataIndex: 'value1',
      key: 'value1',
      render: (_, { value1 }) => <Progress percent={value1} />,
    },
  ];
  const [tableData, setTableData] = useState<any[]>([
    {
      id: 1,
      time: '2024-09-20 13:12',
      value1: '20.11',
      value2: 30,
      title: '172.99.100-cpu-total',
    },
    {
      id: 2,
      time: '2024-09-20 13:18',
      value1: '30.00',
      value2: 20,
      title: '172.99.100-cpu-total',
    },
    {
      id: 3,
      time: '2024-09-20 13:24',
      value1: '10.00',
      value2: 50,
      title: '172.99.100-cpu-total',
    },
    {
      id: 4,
      time: '2024-09-20 13:30',
      value1: '50.00',
      value2: 40,
      title: '172.99.100-cpu-total',
    },
    {
      id: 5,
      time: '2024-09-20 13:36',
      value1: '40.00',
      value2: 60,
      title: '172.99.100-cpu-total',
    },
    {
      id: 6,
      time: '2024-09-20 13:42',
      value1: '60.00',
      value2: 70,
      title: '172.99.100-cpu-total',
    },
    {
      id: 7,
      time: '2024-09-20 13:48',
      value1: '70.00',
      value2: 60,
      title: '172.99.100-cpu-total',
    },
    {
      id: 8,
      time: '2024-09-20 13:54',
      value1: '60.00',
      value2: 80,
      title: '172.99.100-cpu-total',
    },
    {
      id: 9,
      time: '2024-09-20 14:00',
      value1: '80.00',
      value2: 70,
      title: '172.99.100-cpu-total',
    },
    {
      id: 10,
      time: '2024-09-20 14:06',
      value1: '70.00',
      value2: 60,
      title: '172.99.100-cpu-total',
    },
    {
      id: 11,
      time: '2024-09-20 14:12',
      value1: '60.00',
      value2: 50,
      title: '172.99.100-cpu-total',
    },
  ]);

  //   useEffect(() => {
  //     if (isLoading) return;
  //     getInitData();
  //   }, [isLoading]);

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  return (
    <div className={searchStyle.search}>
      <Spin spinning={pageLoading}>
        <CustomTable
          scroll={{ y: 300 }}
          columns={columns}
          dataSource={tableData}
          pagination={pagination}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
        ></CustomTable>
      </Spin>
    </div>
  );
};
export default Asset;
