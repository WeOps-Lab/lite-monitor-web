'use client';

import React from 'react';
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
  const desc = searchParams.get('instance_id');
  const icon = searchParams.get('name') || '';

  const handleBackButtonClick = () => {
    router.push(`/view`);
  };

  const menuItems = [
    {
      label: t('monitor.overview'),
      path: '/view/detail/overview',
      icon: 'shujumoxingguanli',
    },
  ];

  return (
    <WithSideMenuLayout
      intro={<div className="flex items-center">
        <Icon type={icon} className="mr-[10px] text-[20px]" />
        {`${icon}-${desc}`}
      </div>}
      menuItems={menuItems}
      showBackButton={true}
      onBackButtonClick={handleBackButtonClick}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default IntergrationDetailLayout;
