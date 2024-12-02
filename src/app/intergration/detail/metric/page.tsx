'use client';
import React, { useEffect, useState, useRef } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Button, Modal, message, Spin, Segmented } from 'antd';
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
import ImportModal from './importModal';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/auth';
const { confirm } = Modal;
interface ListItem {
  id: string;
  name: string;
  child: MetricItem[];
}

const Configure = () => {
  const { get, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const authContext = useAuth();
  const token = authContext?.token || null;
  const tokenRef = useRef(token);
  const searchParams = useSearchParams();
  const groupName = searchParams.get('name');
  const groupId = searchParams.get('id');
  const groupType = searchParams.get('type');
  const groupRef = useRef<ModalRef>(null);
  const metricRef = useRef<ModalRef>(null);
  const importRef = useRef<ModalRef>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [metricData, setMetricData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groupList, setGroupList] = useState<ListItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [exportDisabled, setExportDisabled] = useState<boolean>(false);

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
      render: (_, record) => <>{record.description || '--'}</>,
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
            label: item.name,
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
    };
    const getGroupList = get(`/api/metrics_group/`, { params });
    const getMetrics = get('/api/metrics/', { params });
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

  const openImportModal = () => {
    importRef.current?.showModal({
      title: t('monitor.importMetric'),
      type: 'add',
      form: {},
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

  const exportMetric = async () => {
    try {
      setExportDisabled(true);
      const response = await axios({
        url: `/reqApi/api/monitor_object/export/${groupId}/`, // 替换为你的导出数据的API端点
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
      link.download = `${groupName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('导出成功');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setExportDisabled(false);
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
          <Button className="mr-[8px]" onClick={openImportModal}>
            {t('monitor.importMetric')}
          </Button>
          <Button
            className="mr-[8px]"
            loading={exportDisabled}
            onClick={exportMetric}
          >
            {t('monitor.exportMetric')}
          </Button>
          <Button
            className="mr-[8px]"
            type="primary"
            onClick={() => openMetricModal('add')}
          >
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
        monitorObject={+activeTab}
        onSuccess={operateGroup}
      />
      <MetricModal
        ref={metricRef}
        monitorObject={+activeTab}
        groupList={groupList}
        onSuccess={operateMtric}
      />
      <ImportModal
        ref={importRef}
        groupName={groupName}
        groupType={groupType}
        onSuccess={operateMtric}
      />
    </div>
  );
};
export default Configure;
