'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Button, Input, Tabs, Tree } from 'antd';
import OperateModal from '@/components/operate-drawer';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import CustomTable from '@/components/custom-table';
import CustomCascader from '@/components/custom-cascader';
import {
  ColumnItem,
  ModalRef,
  ModalConfig,
  TabItem,
  Pagination,
  TableDataItem,
} from '@/types';
import { CloseOutlined } from '@ant-design/icons';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import selectInstanceStyle from './selectInstance.module.less';
import { showGroupName } from '@/utils/common';

const convertCascaderToTreeData = (cascaderData: any) => {
  return cascaderData.map((item: any) => {
    const { label, value, children } = item;
    return {
      title: label,
      key: value,
      children: children ? convertCascaderToTreeData(children) : [],
    };
  });
};

const filterTreeData = (treeData: any, searchText: string) => {
  if (!searchText) return treeData;

  return treeData
    .map((item: any) => {
      const { title, children } = item;
      if (title.toLowerCase().includes(searchText.toLowerCase())) {
        return item;
      }
      if (children) {
        const filteredChildren = filterTreeData(children, searchText);
        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
      }
      return null;
    })
    .filter((item: any) => item !== null);
};

const SelectAssets = forwardRef<ModalRef, ModalConfig>(
  (
    { onSuccess, organizationList, monitorObject, form: { type, values } },
    ref
  ) => {
    const { t } = useTranslation();
    const { get } = useApiClient();
    const { convertToLocalizedTime } = useLocalizedTime();
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Pagination>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [activeTab, setActiveTab] = useState<string>('instance');
    const [tabs, setTabs] = useState<TabItem[]>([
      {
        label: t('monitor.asset'),
        key: 'instance',
      },
      {
        label: t('common.group'),
        key: 'organization',
      },
    ]);
    const isInstance = activeTab === 'instance';
    const [title, setTitle] = useState<string>('');
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string>>([]);
    const [tableData, setTableData] = useState<TableDataItem[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedOrganizations, setSelectedOrganizations] = useState<
      string[]
    >([]);
    const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
    const [treeSearchText, setTreeSearchText] = useState<string>('');
    const columns: ColumnItem[] = [
      {
        title: t('common.name'),
        dataIndex: 'instance_name',
        key: 'instance_name',
      },
      {
        title: t('common.group'),
        dataIndex: 'organization',
        key: 'organization',
        render: (_, { organization }) => (
          <>{showGroupName(organization || [], organizationList)}</>
        ),
      },
      {
        title: t('common.time'),
        dataIndex: 'time',
        key: 'time',
        render: (_, { time }) => (
          <>
            {time ? convertToLocalizedTime(new Date(time * 1000) + '') : '--'}
          </>
        ),
      },
    ];

    useEffect(() => {
      fetchData();
    }, [selectedOrganizations, pagination.current, pagination.pageSize]);

    useImperativeHandle(ref, () => ({
      showModal: ({ title, type: comType }) => {
        // 开启弹窗的交互
        setPagination((prev: Pagination) => ({
          ...prev,
          current: 1,
        }));
        setTableData([]);
        setGroupVisible(true);
        setTitle(title);
        setActiveTab(type || 'instance');
        if (type === 'instance' || !type) {
          fetchData();
          setSelectedRowKeys(values);
        } else {
          setSelectedTreeKeys(values);
        }
      },
    }));

    const changeTab = (val: string) => {
      setActiveTab(val);
      setSelectedRowKeys([]);
      setSelectedTreeKeys([]);
      if (val === 'instance') {
        fetchData();
      }
    };

    const onSelectChange = (selectedKeys: any) => {
      setSelectedRowKeys(selectedKeys);
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const treeData = convertCascaderToTreeData(organizationList);
    const filteredTreeData = filterTreeData(treeData, treeSearchText);

    const handleSubmit = async () => {
      handleCancel();
      onSuccess({
        type: activeTab,
        values: activeTab === 'instance' ? selectedRowKeys : selectedTreeKeys,
      });
    };

    const fetchData = async (type?: string) => {
      try {
        setTableLoading(true);
        const data = await get(`/api/monitor_instance/${monitorObject}/list/`, {
          params: {
            page: pagination.current,
            page_size: pagination.pageSize,
            name: type === 'clear' ? '' : searchText,
            organizations: selectedOrganizations.join(','),
          },
        });
        setTableData(data?.results || []);
        setPagination((prev: Pagination) => ({
          ...prev,
          total: data?.count || 0,
        }));
      } finally {
        setTableLoading(false);
      }
    };

    const handleCancel = () => {
      setGroupVisible(false);
      setSelectedRowKeys([]); // 清空选中项
    };

    const handleTableChange = (pagination: any) => {
      setPagination(pagination);
    };

    const handleClearSelection = () => {
      setSelectedRowKeys([]); // 清空选中项
    };

    const handleRemoveItem = (key: string) => {
      const newSelectedRowKeys = selectedRowKeys.filter((item) => item !== key);
      setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleOrganizationSelect = (selectedKeys: any) => {
      setSelectedTreeKeys(selectedKeys);
    };

    const clearText = () => {
      setSearchText('');
      fetchData('clear');
    };

    return (
      <div>
        <OperateModal
          title={title}
          visible={groupVisible}
          width={800}
          onClose={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                disabled={!selectedRowKeys.length && !selectedTreeKeys.length}
                onClick={handleSubmit}
              >
                {t('common.confirm')}
              </Button>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <div>
            <Tabs activeKey={activeTab} items={tabs} onChange={changeTab} />
            {isInstance ? (
              <div className={selectInstanceStyle.selectInstance}>
                <div className={selectInstanceStyle.instanceList}>
                  <div className="flex items-center justify-between mb-[10px]">
                    <CustomCascader
                      className="mr-[8px]"
                      showSearch
                      maxTagCount="responsive"
                      options={organizationList}
                      onChange={(value) =>
                        setSelectedOrganizations(value as string[])
                      }
                      multiple
                      allowClear
                    />
                    <Input
                      className="w-[320px]"
                      allowClear
                      placeholder={t('common.searchPlaceHolder')}
                      value={searchText}
                      onPressEnter={() => fetchData()}
                      onClear={clearText}
                      onChange={(e) => setSearchText(e.target.value)}
                    ></Input>
                  </div>
                  <CustomTable
                    rowSelection={rowSelection}
                    dataSource={tableData}
                    columns={columns}
                    pagination={pagination}
                    loading={tableLoading}
                    rowKey="instance_id"
                    scroll={{ x: 520, y: 'calc(100vh - 260px)' }}
                    onChange={handleTableChange}
                  />
                </div>
                <div className={selectInstanceStyle.previewList}>
                  <div className="flex items-center justify-between mb-[10px]">
                    <span>
                      {t('common.selected')}（
                      <span className="text-[var(--color-primary)] px-[4px]">
                        {selectedRowKeys.length}
                      </span>
                      {t('common.items')}）
                    </span>
                    <span
                      className="text-[var(--color-primary)] cursor-pointer"
                      onClick={handleClearSelection}
                    >
                      {t('common.clear')}
                    </span>
                  </div>
                  <ul className={selectInstanceStyle.list}>
                    {selectedRowKeys.map((key) => {
                      const item = tableData.find(
                        (data) => data.instance_id === key
                      );
                      return (
                        <li className={selectInstanceStyle.listItem} key={key}>
                          <span>{item?.instance_name || '--'}</span>
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
            ) : (
              <div>
                <Input
                  className="w-[320px] mb-[10px]"
                  placeholder={t('common.searchPlaceHolder')}
                  onChange={(e) => setTreeSearchText(e.target.value)}
                />
                <Tree
                  checkable
                  onCheck={handleOrganizationSelect}
                  checkedKeys={selectedTreeKeys}
                  treeData={filteredTreeData}
                  defaultExpandAll
                />
              </div>
            )}
          </div>
        </OperateModal>
      </div>
    );
  }
);

SelectAssets.displayName = 'selectAssets';
export default SelectAssets;
