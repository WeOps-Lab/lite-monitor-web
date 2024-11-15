'use client';
import React, { useEffect, useState, useRef } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Button, Modal, message, Spin } from 'antd';
import useApiClient from '@/utils/request';
import metricStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import CustomTable from '@/components/custom-table';
import { ColumnItem, ModalRef } from '@/types';
import { DimensionItem, MetricItem, GroupInfo } from '@/types/monitor';
import Collapse from '@/components/collapse';
import GroupModal from './groupModal';
import MetricModal from './metricModal';
import { useSearchParams } from 'next/navigation';
const { confirm } = Modal;
interface ListItem {
  id: string;
  name: string;
  child: MetricItem[];
}

const Configure = () => {
  const { get, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const monitorObjectId = searchParams.get('id') || '';
  const groupRef = useRef<ModalRef>(null);
  const metricRef = useRef<ModalRef>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [metricData, setMetricData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groupList, setGroupList] = useState<ListItem[]>([]);

  const columns: ColumnItem[] = [
    {
      title: t('common.id'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.name'),
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: t('monitor.dimension'),
      dataIndex: 'dimensions',
      key: 'dimensions',
      render: (_, record) => (
        <>
          {record.dimensions?.length
            ? record.dimensions
              .map((item: DimensionItem) => item.name)
              .join(',')
            : '--'}
        </>
      ),
    },
    {
      title: t('monitor.dataType'),
      dataIndex: 'data_type',
      key: 'data_type',
      render: (_, record) => <>{record.data_type || '--'}</>,
    },
    {
      title: t('common.unit'),
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: t('common.descripition'),
      dataIndex: 'description',
      key: 'description',
    },
    // {
    //   title: t('monitor.keyMetric'),
    //   dataIndex: 'keyMetric',
    //   key: 'keyMetric',
    //   render: (_, record) => (
    //     <Switch
    //       size="small"
    //       onChange={handleKeyMetricChange}
    //       value={record.keyMetric}
    //     />
    //   ),
    // },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      render: (_, record) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => openMetricModal('edit', record)}
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

  const showDeleteConfirm = (row: MetricItem) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/metrics/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getInitData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const showGroupDeleteConfirm = (row: ListItem) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/metrics_group/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getInitData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const getInitData = async (type?: string) => {
    const getGroupList = get(`/api/metrics_group/`, {
      params: {
        search: type ? '' : searchText,
      },
    });
    const getMetrics = get('/api/metrics/', {
      params: {
        monitor_object_name: name,
      },
    });
    setLoading(true);
    try {
      Promise.all([getGroupList, getMetrics])
        .then((res) => {
          const groupData = res[0].map((item: GroupInfo) => ({
            ...item,
            child: [],
          }));
          const metricData = res[1];
          metricData.forEach((metric: MetricItem) => {
            const target = groupData.find(
              (item: GroupInfo) => item.id === metric.metric_group
            );
            if (target) {
              target.child.push(metric);
            }
          });
          setGroupList(groupData);
          setMetricData(groupData);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    getInitData();
  };

  const onTxtClear = () => {
    setSearchText('');
    getInitData('clear');
  };

  const openGroupModal = (type: string, row = {}) => {
    const title = t(type === 'add' ? 'monitor.addGroup' : 'monitor.editGroup');
    groupRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const openMetricModal = (type: string, row = {}) => {
    const title = t(
      type === 'add' ? 'monitor.addMetric' : 'monitor.editMetric'
    );
    metricRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const operateGroup = () => {
    getInitData();
  };

  const operateMtric = () => {
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
          <Button
            type="primary"
            className="mr-[8px]"
            onClick={() => openGroupModal('add')}
          >
            {t('monitor.addGroup')}
          </Button>
          <Button type="primary" onClick={() => openMetricModal('add')}>
            {t('monitor.addMetric')}
          </Button>
        </div>
      </div>
      <Spin spinning={loading}>
        {metricData.map((metricItem, index) => (
          <Collapse
            className="mb-[10px]"
            key={metricItem.id}
            title={metricItem.name || ''}
            isOpen={!index}
            icon={
              <div>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openGroupModal('edit', metricItem)}
                ></Button>
                <Button
                  type="link"
                  size="small"
                  disabled={!!metricItem.child?.length}
                  icon={<DeleteOutlined />}
                  onClick={() => showGroupDeleteConfirm(metricItem)}
                ></Button>
              </div>
            }
          >
            <CustomTable
              pagination={false}
              dataSource={metricItem.child || []}
              columns={columns}
              scroll={{ y: 300 }}
              rowKey="id"
            />
          </Collapse>
        ))}
      </Spin>
      <GroupModal
        ref={groupRef}
        monitorObject={+monitorObjectId}
        onSuccess={operateGroup}
      />
      <MetricModal
        ref={metricRef}
        monitorObject={+monitorObjectId}
        groupList={groupList}
        onSuccess={operateMtric}
      />
    </div>
  );
};
export default Configure;
