'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react';
import { Button, Input, Cascader } from 'antd';
import OperateModal from '@/components/operate-modal';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import CustomTable from '@/components/custom-table';
import selectInstanceStyle from './selectInstance.module.less';
import { ColumnItem, ModalRef, ModalConfig } from '@/types';
import { CloseOutlined } from '@ant-design/icons';

const SelectInstance = forwardRef<ModalRef, ModalConfig>(
  ({ onSuccess, organizationList, monitorObject, list }, ref) => {
    const { t } = useTranslation();
    const { get } = useApiClient();
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [pagination, setPagination] = useState<any>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [title, setTitle] = useState<string>('');
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedOrganizations, setSelectedOrganizations] = useState<
      string[]
    >([]);
    const columns: ColumnItem[] = [
      {
        title: t('common.name'),
        dataIndex: 'instance_id',
        key: 'instance_id',
      },
      {
        title: t('monitor.collectionNode'),
        dataIndex: 'agent_id',
        key: 'agent_id',
      },
      {
        title: t('common.group'),
        dataIndex: 'organization',
        key: 'organization',
        render: (_, { organization }) => (
          <>{organization?.length ? organization.join(',') : '--'}</>
        ),
      },
      {
        title: t('common.time'),
        dataIndex: 'time',
        key: 'time',
        render: (_, { time }) => <>{time || '--'}</>,
      },
    ];

    useEffect(() => {
      applyFilters();
    }, [
      tableData,
      searchText,
      selectedOrganizations,
      pagination.current,
      pagination.pageSize,
    ]);

    useImperativeHandle(ref, () => ({
      showModal: ({ title }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setTitle(title);
        setSelectedRowKeys(list);
        fetchData();
      },
    }));

    const applyFilters = useCallback(() => {
      let filtered = tableData;
      // Filter by instance_id
      if (searchText) {
        filtered = filtered.filter((item) =>
          item.instance_id.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      // Filter by selected organizations
      if (selectedOrganizations.length > 0) {
        filtered = filtered.filter((item) =>
          selectedOrganizations.some((org) => item.organization.includes(org))
        );
      }
      // Pagination
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      setFilteredData(filtered.slice(start, end));
      setPagination((prev: any) => ({
        ...prev,
        total: filtered.length,
      }));
    }, [
      searchText,
      selectedOrganizations,
      pagination.current,
      pagination.pageSize,
      tableData,
    ]);

    const onSelectChange = (selectedKeys: any) => {
      setSelectedRowKeys(selectedKeys);
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const handleSubmit = async () => {
      handleCancel();
      onSuccess(selectedRowKeys);
    };

    const fetchData = async () => {
      try {
        setTableLoading(true);
        const data = await get(
          `/api/monitor_instance_group_rule/monitor_object_instances/${monitorObject}/`,
          {
            params: {
              name: '',
            },
          }
        );
        setTableData(data);
      } finally {
        setTableLoading(false);
      }
    };

    const handleCancel = () => {
      setGroupVisible(false);
      setSelectedRowKeys([]); // 清空选中项
    };

    const handleTableChange = (pagination = {}) => {
      setPagination(pagination);
    };

    const handleClearSelection = () => {
      setSelectedRowKeys([]); // 清空选中项
    };

    const handleRemoveItem = (key: string) => {
      const newSelectedRowKeys = selectedRowKeys.filter((item) => item !== key);
      setSelectedRowKeys(newSelectedRowKeys);
    };

    return (
      <div>
        <OperateModal
          title={title}
          visible={groupVisible}
          width={900}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                disabled={!selectedRowKeys.length}
                onClick={handleSubmit}
              >
                {t('common.confirm')}
              </Button>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <div className={selectInstanceStyle.selectInstance}>
            <div className={selectInstanceStyle.instanceList}>
              <div className="flex items-center justify-between mb-[10px]">
                <Cascader
                  className="mr-[8px]"
                  showSearch
                  options={organizationList}
                  onChange={(value) => setSelectedOrganizations(value as any)}
                  multiple
                  allowClear
                />
                <Input
                  className="w-[320px]"
                  placeholder={t('common.searchPlaceHolder')}
                  onChange={(e) => setSearchText(e.target.value)}
                ></Input>
              </div>
              <CustomTable
                rowSelection={rowSelection}
                dataSource={filteredData}
                columns={columns}
                pagination={pagination}
                loading={tableLoading}
                rowKey="instance_id"
                scroll={{ x: 620, y: 'calc(100vh - 200px)' }}
                onChange={handleTableChange}
              />
            </div>
            <div className={selectInstanceStyle.previewList}>
              <div className="flex items-center justify-between mb-[10px]">
                <span>
                  已选择（共
                  <span className="text-[var(--color-primary)] px-[4px]">
                    {selectedRowKeys.length}
                  </span>
                  条）
                </span>
                <span
                  className="text-[var(--color-primary)] cursor-pointer"
                  onClick={handleClearSelection}
                >
                  清空
                </span>
              </div>
              <ul className={selectInstanceStyle.list}>
                {selectedRowKeys.map((key) => {
                  const item = tableData.find(
                    (data) => data.instance_id === key
                  );
                  return (
                    <li className={selectInstanceStyle.listItem} key={key}>
                      <span>{item?.instance_id || '--'}</span>
                      <CloseOutlined
                        className={`text-[12px] ${selectInstanceStyle.operate}`}
                        onClick={() => handleRemoveItem(key)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </OperateModal>
      </div>
    );
  }
);

SelectInstance.displayName = 'slectInstance';
export default SelectInstance;
