'use client';
import React, { useState, useEffect } from 'react';
import ThreeStep from './threeStep';
import { Spin, Form, Input } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { MetricItem, CollectionTargetField } from '@/types/monitor';
import { useSearchParams } from 'next/navigation';
import configureStyle from './index.module.less';

const ParentComponent: React.FC = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [step3Content, setStep3Content] = useState<JSX.Element>(
    <div>Initial Step 3 Content</div>
  );
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    if (isLoading) return;
    getMetrics();
  }, [isLoading]);

  const handleStep2Change = (selected: number[]) => {
    setStep3Content(
      <div>Updated Step 3 Content from Step2: {selected.join(', ')}</div>
    );
  };

  const getMetrics = async () => {
    const params = {
      metric_object: name,
    };
    try {
      setPageLoading(true);
      const data = await get(`/api/metrics/`, {
        params,
      });
      setMetrics(data);
      console.log(data);
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <div className={configureStyle.configure}>
      <Spin spinning={pageLoading}>
        <p className="mb-[20px]">{t('monitor.configureStepIntro')}</p>
        <ThreeStep
          step2Options={metrics}
          step3Content={step3Content}
          onStep2Change={handleStep2Change}
        >
          <Form form={form} name="basic" labelWrap>
            <Form.Item<CollectionTargetField>
              label={<span className="w-[100px]">Instance</span>}
              name="instance_name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
            <Form.Item<CollectionTargetField>
              label={<span className="w-[100px]">Collection Node</span>}
              name="node"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
            {name === 'Website' && (
              <Form.Item<CollectionTargetField>
                label={<span className="w-[100px]">URL</span>}
                name="url"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input className="w-[300px]" />
              </Form.Item>
            )}
            <Form.Item<CollectionTargetField>
              label={<span className="w-[100px]">Interval</span>}
              name="interval"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
          </Form>
        </ThreeStep>
      </Spin>
    </div>
  );
};

export default ParentComponent;
