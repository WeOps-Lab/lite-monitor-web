'use client';
import React, { useRef } from 'react';
import { Descriptions } from 'antd';
import { TableDataItem, Organization } from '@/types';
import { useTranslation } from '@/utils/i18n';
import informationStyle from './index.module.less';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import LineChart from '@/components/charts/lineChart';
import { MetricItem, ObectItem } from '@/types/monitor';
import { findUnitNameById, showGroupName, deepClone } from '@/utils/common';
import { useCommon } from '@/context/common';
import { Modal, message, Button } from 'antd';
import useApiClient from '@/utils/request';

const Information: React.FC<TableDataItem> = ({
  formData,
  chartData,
  objects,
  metrics,
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
        objects.find((item: ObectItem) => item.id === row.monitorObjId)?.name ||
        '',
      instance_id: row.monitor_instance?.id,
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
              borderColor:
                formData.level === 'critical'
                  ? '#F43B2C'
                  : formData.level === 'error'
                    ? '#D97007'
                    : '#FFAD42',
            }}
          >
            <span
              style={{
                color:
                  formData.level === 'critical'
                    ? '#F43B2C'
                    : formData.level === 'error'
                      ? '#D97007'
                      : '#FFAD42',
              }}
            >
              {formData.level}
            </span>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.firstAlertTime')}>
          {formData.created_at
            ? convertToLocalizedTime(formData.created_at)
            : '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.duration')}>
          {formData.policy?.period || '--'}
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
          {formData.notice || 'Unnotified'}
        </Descriptions.Item>
        <Descriptions.Item label={t('common.operator')}>
          {formData.operator || '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.notifier')}>
          {(formData.policy?.notice_users || []).join(',') || '--'}
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
