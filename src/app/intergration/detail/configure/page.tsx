'use client';
import React, { useState, useEffect } from 'react';
import ThreeStep from './threeStep';
import { Spin, Form, Input, Select, Button, message } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { MetricItem, CollectionTargetField } from '@/types/monitor';
import { useSearchParams } from 'next/navigation';
import configureStyle from './index.module.less';
const { Option } = Select;

const Configure: React.FC = () => {
  const { get, post, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const objId = searchParams.get('id') || '';
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [step3Content, setStep3Content] = useState<JSX.Element | string>('');
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [originMetrics, setoriginMetrics] = useState<MetricItem[]>([
    {
      id: 0,
      metric_group: 0,
      metric_object: 0,
      name: 'All',
      type: 'none',
      dimensions: [],
    },
  ]);
  const [intervalUnit, setIntervalUnit] = useState<string>('s');

  useEffect(() => {
    if (isLoading) return;
    // getMetrics();
  }, [isLoading]);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      interval: 10,
    });
  }, [name]);

  const createContent = () => {
    form?.validateFields().then((values) => {
      if (intervalUnit === 'm') {
        values.interval = values.interval * 60;
      } else {
        values.interval = +values.interval;
      }
      getStep3Content(values);
    });
  };

  const getStep3Content = async (params = { interval: '' }) => {
    try {
      setLoading(true);
      const instnaceId = await post(
        `/api/monitor_instance/${objId}/generate_instance_id/`,
        params
      );
      let content: string | JSX.Element = '';
      switch (name) {
        case 'Website':
          break;
        case 'K8S':
          break;
        default:
          content = (
            <div>
              <ul>
                <li>{'[global_tags]'}</li>
                <li>{'agent_id="${node.name}"'}</li>
              </ul>
              <ul>
                <li>{'[agent]'}</li>
                <li>{`interval = "${params.interval}s"`}</li>
                <li>{'round_interval = true'}</li>
                <li>{'metric_batch_size = 1000'}</li>
                <li>{'metric_buffer_limit = 10000'}</li>
                <li>{'collection_jitter = "0s"'}</li>
                <li>{'flush_jitter = "30s"'}</li>
                <li>{'precision = "0s"'}</li>
                <li>{'hostname = "${node.name}"'}</li>
                <li>{'omit_hostname = false'}</li>
              </ul>
              <ul>
                <li>{'[[outputs.kafka]]'}</li>
                <li>{'brokers = ["${KAFKA_ADDR}:${KAFKA_PORT}"]'}</li>
                <li>{'topic = "telegraf"'}</li>
                <li>{'sasl_username = "${KAFKA_USERNAME}"'}</li>
                <li>{'sasl_password = "${KAFKA_PASSWORD}"'}</li>
                <li>{'sasl_mechanism = "PLAIN"'}</li>
                <li>{'max_message_bytes = 10000000'}</li>
                <li>{'compression_codec=1'}</li>
              </ul>
              <ul>
                <li>{'[[inputs.internal]]'}</li>
                <li>{`tags = { "instance_id"="${instnaceId}"}`}</li>
              </ul>
              <ul>
                <li>{'[[inputs.prometheus]]'}</li>
                <li>{'urls = ["http://127.0.0.1:41000/metrics"]'}</li>
                <li>{`tags = { "instance_id"="${instnaceId}"}`}</li>
              </ul>
              <ul>
                <li>{'[[inputs.prometheus]]'}</li>
                <li>
                  {
                    'urls = ["http://127.0.0.1:41001/probe?target=https://wedoc.canway.net/&module=http_2xx"]'
                  }
                </li>
                <li>{`tags = { "instance_id"="${instnaceId}"}`}</li>
              </ul>
            </div>
          );
      }
      message.success(t('common.successfullyAdded'));
      setStep3Content(content);
    } finally {
      setLoading(false);
    }
  };

  const changeStep3Content = () => {
    setStep3Content(<></>);
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
    if (changedValues) return;
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
          metricsDisabled={true}
          step2Options={originMetrics}
          step3Content={step3Content}
          step3Config={
            <Button type="primary" loading={loading} onClick={createContent}>
              {t('monitor.generateConfiguration')}
            </Button>
          }
          onStep2Change={handleStep2Change}
        >
          <Form form={form} name="basic" onValuesChange={handleValuesChange}>
            <Form.Item<CollectionTargetField>
              label={
                <span className="w-[100px]">{t('monitor.instanceName')}</span>
              }
              name="monitor_instance_name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
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
