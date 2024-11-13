'use client';

import React, { useState } from 'react';
import PermissionWrapper from '@/components/permission';
import Icon from '@/components/icon';
import CustomTable from '@/components/custom-table';
import { ColumnItem } from '@/types';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';

const DocumentPage = () => {
  const initColums = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    { key: 'age', title: 'Age', dataIndex: 'age' },
  ];
  const { convertToLocalizedTime } = useLocalizedTime();
  const [displayFieldKeys, setDisplayFieldKeys] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>(initColums);
  const handleSettingsClick = () => {
    console.log('click');
  };
  const onSelectFields = (keys: string[]) => {
    const _columns: ColumnItem[] = [];
    keys.forEach((item: string) => {
      const target = initColums.find(tex => tex.key === item);
      if (target) {
        _columns.push(target);
      }
    });
    setColumns(_columns);
    setDisplayFieldKeys(keys);
  };

  return (
    <div>
      <h1>Document Pageqee</h1>
      <p>This is the document page.</p>
      <PermissionWrapper requiredPermissions={['write']}>
        <button onClick={handleSettingsClick}>
          <Icon type="shezhi" className="text-base" />
        </button>
      </PermissionWrapper>
      <CustomTable
        dataSource={[]}
        columns={columns}
        scroll={{ y: 300 }}
        fieldSetting={{
          showSetting: true,
          displayFieldKeys,
          choosableFields: initColums.filter((item) => item.key !== 'action'),
        }}
        rowKey="id"
        onSelectFields={onSelectFields}
      />
      <div>eg:时区转时间 - {convertToLocalizedTime('2024-10-28T10:20:31+0000')}</div>
    </div>
  );
};

export default DocumentPage;
