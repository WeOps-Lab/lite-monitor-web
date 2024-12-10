'use client';

import React from 'react';
import { Tooltip } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import { OBJECT_ICON_MAP } from '@/constants/monitor';

const IntergrationDetailLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get('plugin_name');
  const desc = searchParams.get('plugin_description');
  const icon = OBJECT_ICON_MAP[searchParams.get('name') as string] || 'Host';
  console.log(icon);

  const handleBackButtonClick = () => {
    router.push(`/intergration`);
  };

  const menuItems = [
    {
      label: t('monitor.configure'),
      path: '/intergration/detail/configure',
      icon: 'shujumoxingguanli',
    },
    {
      label: t('monitor.metric'),
      path: '/intergration/detail/metric',
      icon: 'zichan-quanbushebei',
    },
  ];

  const TopSection = () => (
    <div className="p-4 rounded-md w-full h-[95px] flex items-center bg-[var(--color-bg-1)]">
      <Icon type={icon} className="text-6xl mr-[10px] min-w-[60px]" />
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-2">{groupId}</h2>
        <Tooltip title={desc}>
          <p className="truncate w-[95%] text-sm hide-text">{desc}</p>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <WithSideMenuLayout
      menuItems={menuItems}
      topSection={<TopSection />}
      showBackButton={true}
      onBackButtonClick={handleBackButtonClick}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default IntergrationDetailLayout;
