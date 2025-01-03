'use client';
import React, { useEffect, useState, useRef } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Button, Modal, message, Spin, Segmented, Empty } from 'antd';
import useApiClient from '@/utils/request';
import metricStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import CustomTable from '@/components/custom-table';
import { ColumnItem, ModalRef } from '@/types';
import {
  DimensionItem,
  MetricItem,
  GroupInfo,
  IntergrationItem,
  ObectItem,
} from '@/types/monitor';
import Collapse from '@/components/collapse';
import GroupModal from './groupModal';
import MetricModal from './metricModal';
import { useSearchParams } from 'next/navigation';
import { deepClone } from '@/utils/common';
const { confirm } = Modal;

interface ListItem {
  id: string;
  name: string;
  child: MetricItem[];
  display_name?: string;
  is_pre: boolean;
}

const Configure = () => {
  const { get, del, isLoading, post } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const groupName = searchParams.get('name');
  const groupId = searchParams.get('id');
  const pluginID = searchParams.get('plugin_id') || '';
  const groupRef = useRef<ModalRef>(null);
  const metricRef = useRef<ModalRef>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [metricData, setMetricData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groupList, setGroupList] = useState<ListItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  const columns: ColumnItem[] = [
    {
      title: t('common.id'),
      dataIndex: 'name',
      width: 100,
      key: 'name',
    },
    {
      title: t('common.name'),
      dataIndex: 'display_name',
      width: 100,
      key: 'display_name',
    },
    {
      title: t('monitor.intergrations.dimension'),
      dataIndex: 'dimensions',
      width: 100,
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
      title: t('monitor.intergrations.dataType'),
      dataIndex: 'data_type',
      key: 'data_type',
      width: 100,
      render: (_, record) => <>{record.data_type || '--'}</>,
    },
    {
      title: t('common.unit'),
      dataIndex: 'unit',
      width: 100,
      key: 'unit',
      render: (_, record) => (
        <>{record.data_type === 'Enum' ? '--' : record.unit || '--'}</>
      ),
    },
    {
      title: t('common.descripition'),
      dataIndex: 'display_description',
      key: 'display_description',
      render: (_, record) => <>{record.display_description || '--'}</>,
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      width: 130,
      render: (_, record) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            disabled={record.is_pre}
            onClick={() => openMetricModal('edit', record)}
          >
            {t('common.edit')}
          </Button>
          <Button
            type="link"
            disabled={record.is_pre}
            onClick={() => showDeleteConfirm(record)}
          >
            {t('common.delete')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  const getObjects = async (text?: string) => {
    setLoading(true);
    let _objId = '';
    try {
      if (groupName === 'Cluster') {
        const data = await get(`/api/monitor_object/`);
        const _items = data
          .filter((item: ObectItem) => item.type === 'K8S')
          .sort((a: ObectItem, b: ObectItem) => a.id - b.id)
          .map((item: ObectItem) => ({
            label: item.display_name,
            value: item.id,
          }));
        _objId = _items[0]?.value;
        setItems(_items);
      } else {
        _objId = groupId || '';
      }
      setActiveTab(_objId);
      getInitData(_objId);
    } catch {
      setLoading(false);
    }
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

  const getInitData = async (objId = activeTab) => {
    const params = {
      monitor_object_id: +objId,
      monitor_plugin_id: +pluginID,
    };
    const getGroupList = get(`/api/metrics_group/`, {
      params: {
        ...params,
        name: searchText,
      },
    });
    const getMetrics = get('/api/metrics/', {
      params: {
        ...params,
        monitor_plugin_id: +pluginID,
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
    getInitData();
  };

  const openGroupModal = (type: string, row = {}) => {
    const title = t(
      type === 'add'
        ? 'monitor.intergrations.addGroup'
        : 'monitor.intergrations.editGroup'
    );
    groupRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const openMetricModal = (type: string, row = {}) => {
    const title = t(
      type === 'add'
        ? 'monitor.intergrations.addMetric'
        : 'monitor.intergrations.editMetric'
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

  const onTabChange = (val: string) => {
    setMetricData([]);
    setActiveTab(val);
    getInitData(val);
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingItemId(id);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggingItemId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const onDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    e.preventDefault();
    if (draggingItemId && draggingItemId !== targetId) {
      const draggingIndex = metricData.findIndex(
        (item) => item.id === draggingItemId
      );
      const targetIndex = metricData.findIndex((item) => item.id === targetId);
      const reorderedData = deepClone(metricData);
      const [draggedItem] = reorderedData.splice(draggingIndex, 1);
      reorderedData.splice(targetIndex, 0, draggedItem);
      if (draggingIndex !== -1 && targetIndex !== -1) {
        try {
          setLoading(true);
          const updatedOrder = reorderedData.map(
            (item: MetricItem, index: number) => ({
              id: item.id,
              sort_order: index,
            })
          );
          await post('/api/metrics_group/set_order/', updatedOrder);
          message.success(t('common.updateSuccess'));
          getInitData();
        } catch (error) {
          setLoading(false);
        }
      }
      setDraggingItemId(null);
    }
  };

  return (
    <div className={metricStyle.metric}>
      {groupName === 'Cluster' && (
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
      )}
      <p className="mb-[10px] text-[var(--color-text-2)]">
        {t('monitor.intergrations.metricTitle')}
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
            {t('monitor.intergrations.addGroup')}
          </Button>
          <Button onClick={() => openMetricModal('add')}>
            {t('monitor.intergrations.addMetric')}
          </Button>
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={metricStyle.metricTable}>
          {!!metricData.length ? (
            metricData.map((metricItem, index) => (
              <Collapse
                className="mb-[10px]"
                key={metricItem.id}
                sortable
                onDragStart={(e) => onDragStart(e, metricItem.id)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, metricItem.id)}
                title={metricItem.display_name || ''}
                isOpen={!index}
                icon={
                  <div>
                    <Button
                      type="link"
                      size="small"
                      disabled={metricItem.is_pre}
                      icon={<EditOutlined />}
                      onClick={() => openGroupModal('edit', metricItem)}
                    ></Button>
                    <Button
                      type="link"
                      size="small"
                      disabled={!!metricItem.child?.length || metricItem.is_pre}
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
                  rowKey="id"
                />
              </Collapse>
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Spin>
      <GroupModal
        ref={groupRef}
        monitorObject={+activeTab}
        onSuccess={operateGroup}
      />
      <MetricModal
        ref={metricRef}
        monitorObject={+activeTab}
        pluginId={+pluginID}
        groupList={groupList}
        onSuccess={operateMtric}
      />
    </div>
  );
};
export default Configure;
