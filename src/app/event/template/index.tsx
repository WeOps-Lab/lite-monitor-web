'use client';
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Input, Tree, Modal, message } from 'antd';
import useApiClient from '@/utils/request';
import assetStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import { TreeItem, ModalRef, Organization, Pagination } from '@/types';
import { ObectItem, RuleInfo, AlertProps } from '@/types/monitor';
const { Search } = Input;
import { useCommon } from '@/context/common';
import { deepClone, showGroupName, getRandomColor } from '@/utils/common';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
const { confirm } = Modal;

const Strategy: React.FC<AlertProps> = ({ objects }) => {
  const { t } = useTranslation();
  const { get, del, isLoading } = useApiClient();
  const commonContext = useCommon();
  const { convertToLocalizedTime } = useLocalizedTime();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const ruleRef = useRef<ModalRef>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (!isLoading) {
      getObjects();
    }
  }, [isLoading]);

  useEffect(() => {
    if (selectedKeys[0]) {
      getAssetInsts(selectedKeys[0]);
    }
  }, [
    selectedOrganizations,
    pagination.current,
    pagination.pageSize,
    selectedKeys,
  ]);

  const getParams = (text?: string) => {
    return {
      name: text ? '' : searchText,
      page: pagination.current,
      page_size: pagination.pageSize,
      organizations: selectedOrganizations.join(','),
      monitor_object_id: selectedKeys[0] || '',
    };
  };

  const openRuleModal = (type: string, row = {}) => {
    const title = t(type === 'add' ? 'monitor.addRule' : 'monitor.editRule');
    ruleRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const getAssetInsts = async (objectId: React.Key, text?: string) => {
    try {
      setTableLoading(true);
      const params = getParams(text);
      params.monitor_object_id = objectId;
      const data = await get(`/api//monitor_policy/`, {
        params,
      });
      setTableData(data.items || []);
      setPagination((pre) => ({
        ...pre,
        total: data.count,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      let data: ObectItem[] = objects;
      if (text) {
        data = await get(`/api/monitor_object/`, {
          params: {
            name: text || '',
          },
        });
      }
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setExpandedKeys(_treeData.map((item) => item.key));
      const defaultChildren = _treeData[0]?.children;
      if (defaultChildren?.length) {
        const key = defaultChildren[0].key;
        setSelectedKeys([key]);
      }
    } finally {
      setPageLoading(false);
    }
  };

  const getTreeData = (data: ObectItem[]): TreeItem[] => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {
          title: item.type,
          key: item.type,
          children: [],
        };
      }
      acc[item.type].children.push({
        title: item.name,
        key: item.id,
        children: [],
      });
      return acc;
    }, {} as Record<string, TreeItem>);
    return Object.values(groupedData);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const isFirstLevel = !!info.node?.children?.length;
    if (!isFirstLevel && selectedKeys?.length) {
      setPagination((prev: Pagination) => ({
        ...prev,
        current: 1,
      }));
      setSelectedKeys(selectedKeys);
    }
  };

  const onSearchTree = (value: any) => {
    getObjects(value);
  };

  const showDeleteConfirm = (row: RuleInfo) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/monitor_instance_group_rule/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const enterText = () => {
    getAssetInsts(selectedKeys[0]);
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts(selectedKeys[0], 'clear');
  };

  return (
    <Spin spinning={pageLoading}>
      <div className={assetStyle.asset}>
        <div className={assetStyle.tree}>
          <Search
            className="mb-[10px]"
            placeholder={t('common.searchPlaceHolder')}
            onSearch={onSearchTree}
          />
          <Tree
            className={assetStyle.tree}
            showLine
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
            onSelect={onSelect}
            treeData={treeData}
          />
        </div>
        <div className={assetStyle.table}>监控模板</div>
      </div>
    </Spin>
  );
};
export default Strategy;
