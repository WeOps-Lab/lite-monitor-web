'use client';

import React from 'react';
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
  const desc = searchParams.get('instance_name');
  const icon = OBJECT_ICON_MAP[searchParams.get('name') || ''];

  const handleBackButtonClick = () => {
    router.push(`/view`);
  };

  const menuItems = [
    {
      label: t('monitor.views.overview'),
      path: '/view/detail/overview',
      icon: 'shujumoxingguanli',
    },
  ];

  return (
    <WithSideMenuLayout
      intro={
        <div className="flex items-center">
          <Icon type={icon} className="mr-[10px] text-[20px] min-w-[20px]" />
          <div className="flex items-center">
            {icon}
            <span className="text-[12px] text-[var(--color-text-3)] ml-[4px]">
              {`- ${desc}`}
            </span>
          </div>
        </div>
      }
      menuItems={menuItems}
      showBackButton={true}
      onBackButtonClick={handleBackButtonClick}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default IntergrationDetailLayout;
