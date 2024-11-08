'use client';
import React, { useState, useEffect } from 'react';
import ThreeStep from './threeStep';
import { Spin, Form, Input, Select } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { MetricItem, CollectionTargetField } from '@/types/monitor';
import { useSearchParams } from 'next/navigation';
import configureStyle from './index.module.less';
const { Option } = Select;

const Configure: React.FC = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [step3Content, setStep3Content] = useState<JSX.Element>(<></>);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [originMetrics, setoriginMetrics] = useState<MetricItem[]>([]);
  const [intervalUnit, setIntervalUnit] = useState<string>('s');

  useEffect(() => {
    if (isLoading) return;
    getMetrics();
  }, [isLoading]);

  useEffect(() => {
    changeStep3Content();
  }, [name, intervalUnit, metrics]);

  const changeStep3Content = () => {
    const formData = form.getFieldsValue();
    const html = (
      <>
        <ul>
          {metrics.map((item) => (
            <li className="mb-[10px]" key={item.id}>{`[[${item.name}]]`}</li>
          ))}
        </ul>
        <ul>
          {Object.entries(formData).map(([key, value]) =>
            key === 'interval' ? (
              <li key={key}>{`${key}='${value}${intervalUnit}'`}</li>
            ) : (
              <li className="mb-[10px]" key={key}>{`${key}='${value}'`}</li>
            )
          )}
        </ul>
      </>
    );
    setStep3Content(html);
  };

  const handleStep2Change = (selected: number[]) => {
    const metricsIds = originMetrics.filter((item) =>
      selected.includes(item.id)
    );
    setMetrics(metricsIds);
  };

  const getMetrics = async () => {
    const params = {
      monitor_object_name: name,
    };
    try {
      setPageLoading(true);
      const data = await get(`/api/metrics/`, {
        params,
      });
      setMetrics(data);
      setoriginMetrics(data);
    } finally {
      setPageLoading(false);
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    changeStep3Content();
  };

  const handleIntervalChange = (value: string) => {
    setIntervalUnit(value);
  };

  return (
    <div className={configureStyle.configure}>
      <Spin spinning={pageLoading}>
        <p className="mb-[20px]">{t('monitor.configureStepIntro')}</p>
        <ThreeStep
          metricsDisabled={name === 'K8S'}
          step2Options={originMetrics}
          step3Content={step3Content}
          onStep2Change={handleStep2Change}
        >
          <Form form={form} name="basic" onValuesChange={handleValuesChange}>
            <Form.Item<CollectionTargetField>
              label={
                <span className="w-[100px]">{t('monitor.instanceName')}</span>
              }
              name="instance_name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
            <Form.Item<CollectionTargetField>
              label={
                <span className="w-[100px]">{t('monitor.collectionNode')}</span>
              }
              name="node"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
            {name === 'Website' && (
              <Form.Item<CollectionTargetField>
                label={<span className="w-[100px]">{t('monitor.url')}</span>}
                name="url"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input className="w-[300px]" />
              </Form.Item>
            )}
            <Form.Item<CollectionTargetField>
              label={<span className="w-[100px]">{t('monitor.interval')}</span>}
              className={configureStyle.interval}
            >
              <Form.Item
                name="interval"
                noStyle
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input className="w-[300px]" />
              </Form.Item>
              <Select
                className="ml-[10px]"
                style={{ width: '100px' }}
                onChange={handleIntervalChange}
                value={intervalUnit}
              >
                <Option value="s">s</Option>
                <Option value="m">min</Option>
              </Select>
            </Form.Item>
          </Form>
        </ThreeStep>
      </Spin>
    </div>
  );
};

export default Configure;
