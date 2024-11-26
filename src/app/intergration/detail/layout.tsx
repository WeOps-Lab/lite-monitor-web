'use client';

import React from 'react';
import { Tooltip } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';

const IntergrationDetailLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const groupId = searchParams.get('name');
  const desc = searchParams.get('description');
  const icon =
    searchParams.get('name') === 'Cluster'
      ? 'K8S'
      : searchParams.get('name') || '';

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
      <Icon type={icon} className="text-6xl mr-[10px]" />
      <div>
        <h2 className="text-lg font-semibold mb-2">{groupId}</h2>
        <Tooltip title={desc}>
          <p className="truncate max-w-full text-sm">{desc}</p>
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
