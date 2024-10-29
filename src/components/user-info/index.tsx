import React, { useState } from 'react';
import { Dropdown, Space, Menu, Avatar } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { DownOutlined } from '@ant-design/icons';
import Theme from '@/components/theme';
import { useTranslation } from '@/utils/i18n';

const UserInfo = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const username = session?.username || 'Qiu-Jia';

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const items: Array<{ label: JSX.Element; key: string } | { type: 'divider' }> = [
    {
      label: <a onClick={handleLogout}>{t('common.logout')}</a>,
      key: '',
    }
  ];

  return (
    <div className='flex'>
      {username && (
        <Dropdown overlay={<Menu items={items} />} trigger={['click']}>
          <a className='cursor-pointer' onClick={(e) => e.preventDefault()}>
            <Space className='text-sm'>
              <Avatar 
                size={20}
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  verticalAlign: 'middle' 
                }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
              {username}
              <DownOutlined style={{ fontSize: '10px' }} />
            </Space>
          </a>
        </Dropdown>
      )}
      <Theme />
    </div>
  );
};

export default UserInfo;
