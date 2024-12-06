'use client';
import React, { useRef } from 'react';
import { Descriptions } from 'antd';
import { TableDataItem, Organization, UserItem } from '@/types';
import { useTranslation } from '@/utils/i18n';
import informationStyle from './index.module.less';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import LineChart from '@/components/charts/lineChart';
import { MetricItem, ObectItem } from '@/types/monitor';
import { findUnitNameById, showGroupName } from '@/utils/common';
import { useCommon } from '@/context/common';
import { Modal, message, Button } from 'antd';
import useApiClient from '@/utils/request';
import { LEVEL_MAP, LEVEL_LIST } from '@/constants/monitor';

const Information: React.FC<TableDataItem> = ({
  formData,
  chartData,
  objects,
  metrics,
  userList,
  onClose,
}) => {
  const { t } = useTranslation();
  const { convertToLocalizedTime } = useLocalizedTime();
  const { confirm } = Modal;
  const { patch } = useApiClient();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;

  const getIndexName = () => {
    const target = metrics.find(
      (item: MetricItem) => item.id === formData.policy?.metric
    );
    if (target) {
      return `${target.display_name}（${findUnitNameById(target.unit)}）`;
    }
  };

  const checkDetail = (row: TableDataItem) => {
    const params = {
      monitorObjId: row.monitor_instance?.monitor_object,
      name:
        objects.find(
          (item: ObectItem) => item.id === row.monitor_instance?.monitor_object
        )?.name || '',
      instance_id: row.monitor_instance?.id,
      instance_name: row.monitor_instance?.name,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `/view/detail/overview?${queryString}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showAlertCloseConfirm = (row: TableDataItem) => {
    confirm({
      title: t('monitor.closeTitle'),
      content: t('monitor.closeContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await patch(`/api/monitor_alert/${row.id}/`, {
              status: 'closed',
            });
            message.success(t('monitor.successfullyClosed'));
            onClose();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const getUsers = (id: string) => {
    return userList.find((item: UserItem) => item.id === id)?.username || '--';
  };

  const showNotifiers = (row: TableDataItem) => {
    return (row.policy?.notice_users || [])
      .map((item: string) => getUsers(item))
      .join(',');
  };

  return (
    <div className={informationStyle.information}>
      <Descriptions title={t('monitor.information')} column={2} bordered>
        <Descriptions.Item label={t('common.time')}>
          {formData.updated_at
            ? convertToLocalizedTime(formData.updated_at)
            : '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.level')}>
          <div
            className={informationStyle.level}
            style={{
              borderLeft: `4px solid ${LEVEL_MAP[formData.level]}`,
            }}
          >
            <span
              style={{
                color: LEVEL_MAP[formData.level] as string,
              }}
            >
              {LEVEL_LIST.find((item) => item.value === formData.level)
                ?.label || '--'}
            </span>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.firstAlertTime')}>
          {formData.start_event_time
            ? convertToLocalizedTime(formData.start_event_time)
            : '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.information')} span={3}>
          {`${formData.content},${t('monitor.value')}:${formData.alertValue}`}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.assetType')}>
          {objects.find(
            (item: ObectItem) =>
              item.id === formData.monitor_instance?.monitor_object
          )?.name || '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.asset')}>
          <div className="flex justify-between">
            {formData.monitor_instance?.name || '--'}{' '}
            <a
              href="#"
              className="text-blue-500 w-[36px]"
              onClick={() => checkDetail(formData)}
            >
              More
            </a>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.assetGroup')}>
          {showGroupName(
            formData.policy?.organizations || [],
            organizationList
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.strategy')}>
          {formData.policy?.name || '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.notify')}>
          {formData.policy.notice ? 'Notified' : 'Unnotified'}
        </Descriptions.Item>
        <Descriptions.Item label={t('common.operator')}>
          {formData.operator || '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.notifier')}>
          {showNotifiers(formData)}
        </Descriptions.Item>
      </Descriptions>
      <div className="mt-4">
        <Button
          type="link"
          disabled={formData.status !== 'new'}
          onClick={() => showAlertCloseConfirm(formData)}
        >
          {t('monitor.closeAlert')}
        </Button>
      </div>
      <div className="mt-4">
        <h3 className="font-[600] text-[16px] mb-[15px]">
          {t('monitor.indexView')}
        </h3>
        <div className="text-[12px]">{getIndexName()}</div>
        <div className="h-[250px]">
          <LineChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Information;
