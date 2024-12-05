'use client';
'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Spin,
  Input,
  Button,
  Form,
  Cascader,
  Select,
  message,
  Steps,
  Switch,
  Radio,
  InputNumber,
} from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { ModalRef, Organization, ListItem, UserItem } from '@/types';
import {
  AlertProps,
  StrategyFields,
  SourceFeild,
  MetricItem,
  FilterItem,
  ThresholdField,
} from '@/types/monitor';
import { useCommon } from '@/context/common';
import { deepClone } from '@/utils/common';
import strategyStyle from './index.module.less';
import {
  PlusOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import SelectAssets from './selectAssets';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CONDITION_LIST,
  METHOD_LIST,
  PERIOD_LIST,
  SCHEDULE_LIST,
  COMPARISON_METHOD,
  LEVEL_MAP,
  LEVEL_LIST,
  SCHEDULE_UNIT_MAP,
} from '@/constants/monitor';
const { Option } = Select;
import Icon from '@/components/icon';

const StrategyOperation = () => {
  const { t } = useTranslation();
  const { get, post, put, isLoading } = useApiClient();
  const commonContext = useCommon();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const router = useRouter();
  const authList = useRef(commonContext?.authOrganizations || []);
  const users = useRef(commonContext?.userList || []);
  const organizationList: Organization[] = authList.current;
  const userList: UserItem[] = users.current;
  const instRef = useRef<ModalRef>(null);
  const monitorObjId = searchParams.get('monitorObjId');
  const monitorName = searchParams.get('monitorName');
  const type = searchParams.get('type');
  const detailId = searchParams.get('id');
  const detailName = searchParams.get('name') || '--';
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [openNoData, setOpenNoData] = useState<boolean>(false);
  const [source, setSource] = useState<SourceFeild>({
    type: '',
    values: [],
  });
  const [metric, setMetric] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [unit, setUnit] = useState<string>('min');
  const [conditions, setConditions] = useState<FilterItem[]>([]);
  const [noDataAlert, setNoDataAlert] = useState<number | null>(null);
  const [noDataLevel, setNoDataLevel] = useState<string>();
  const [formData, setFormData] = useState<StrategyFields>({
    threshold: [],
    source: { type: '', values: [] },
  });
  const [threshold, setThreshold] = useState<ThresholdField[]>([
    {
      level: 'critical',
      method: '>',
      value: null,
    },
    {
      level: 'error',
      method: '>',
      value: null,
    },
    {
      level: 'warning',
      method: '>',
      value: null,
    },
  ]);

  useEffect(() => {
    if (!isLoading) {
      getMetrics({
        monitor_object_id: monitorObjId,
      });
      detailId && getStragyDetail();
    }
  }, [isLoading]);

  useEffect(() => {
    form.resetFields();
    if (type === 'add') {
      form.setFieldsValue({
        notice_type: 'email',
        notice: false,
      });
    } else {
      dealDetail(formData);
    }
  }, [type, formData, metrics]);

  const dealDetail = (data: StrategyFields) => {
    const {
      metric,
      source,
      schedule,
      filter,
      threshold,
      no_data_alert,
      no_data_level,
    } = data;
    form.setFieldsValue({
      ...data,
      schedule: schedule?.value || null,
    });
    const _metrics = metrics.find((item) => item.id === metric);
    const _labels = (_metrics?.dimensions || []).map((item) => item.name);
    setMetric(_metrics?.name || '');
    setLabels(_labels);
    setConditions(filter || []);
    setThreshold(threshold || []);
    setSource(
      source || {
        type: '',
        values: [],
      }
    );
    setNoDataAlert(no_data_alert || null);
    setNoDataLevel(no_data_level || '');
    setOpenNoData(!!no_data_level);
    setUnit(schedule?.type || '');
  };

  const openInstModal = () => {
    const title = `${t('common.select')} ${t('monitor.asset')}`;
    instRef.current?.showModal({
      title,
      type: 'add',
      form: {},
    });
  };

  const validateAssets = async () => {
    if (!source.values.length) {
      return Promise.reject(new Error(t('monitor.assetValidate')));
    }
    return Promise.resolve();
  };

  const validateMetric = async () => {
    if (!metric) {
      return Promise.reject(new Error(t('monitor.metricValidate')));
    }
    if (
      conditions.length &&
      conditions.some((item) => {
        return Object.values(item).some((tex) => !tex);
      })
    ) {
      return Promise.reject(new Error(t('monitor.conditionValidate')));
    }
    return Promise.resolve();
  };

  const validateThreshold = async () => {
    if (
      threshold.length &&
      threshold.some((item) => {
        return Object.values(item).some((tex) => !tex);
      })
    ) {
      return Promise.reject(new Error(t('monitor.conditionValidate')));
    }
    return Promise.resolve();
  };

  const validateNoData = async () => {
    if (openNoData && (!noDataAlert || !noDataLevel)) {
      return Promise.reject(new Error(t('monitor.conditionValidate')));
    }
    return Promise.resolve();
  };

  const onChooseAssets = (assets: SourceFeild) => {
    setSource(assets);
  };

  const handleMetricChange = (val: string) => {
    setMetric(val);
    const target = metrics.find((item) => item.name === val);
    const _labels = (target?.dimensions || []).map((item) => item.name);
    setLabels(_labels);
  };

  const getMetrics = async (params = {}) => {
    try {
      setMetricsLoading(true);
      const data: MetricItem[] = await get('/api/metrics/', {
        params,
      });
      setMetrics(data);
    } finally {
      setMetricsLoading(false);
    }
  };

  const getStragyDetail = async () => {
    try {
      setPageLoading(true);
      const data = await get(`/api/monitor_policy/${detailId}/`);
      setFormData(data);
    } finally {
      setPageLoading(false);
    }
  };

  const handleLabelChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].name = val;
    setConditions(_conditions);
  };

  const handleConditionChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].method = val;
    setConditions(_conditions);
  };

  const handleUnitChange = (val: string) => {
    setUnit(val);
    form.setFieldsValue({
      schedule: null,
    });
  };

  const handleThresholdMethodChange = (val: string, index: number) => {
    const _conditions = deepClone(threshold);
    _conditions[index].method = val;
    setThreshold(_conditions);
  };

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const _conditions = deepClone(conditions);
    _conditions[index].value = e.target.value;
    setConditions(_conditions);
  };

  const handleNoDataAlertChange = (e: number | null) => {
    setNoDataAlert(e);
  };

  const handleThresholdValueChange = (e: number | null, index: number) => {
    const _conditions = deepClone(threshold);
    _conditions[index].value = e;
    setThreshold(_conditions);
  };

  const addConditionItem = () => {
    const _conditions = deepClone(conditions);
    _conditions.push({
      name: null,
      method: null,
      value: '',
    });
    setConditions(_conditions);
  };

  const deleteConditionItem = (index: number) => {
    const _conditions = deepClone(conditions);
    _conditions.splice(index, 1);
    setConditions(_conditions);
  };

  const handleNoDataChange = (bool: boolean) => {
    setOpenNoData(bool);
    setNoDataAlert(null);
    setNoDataLevel('');
  };

  const goBack = () => {
    router.push('/event?active=strategy');
  };

  const createStrategy = () => {
    form?.validateFields().then((values) => {
      const _values = deepClone(values);
      _values.filter = conditions;
      _values.source = source;
      _values.metric = metrics.find((item) => item.name === metric)?.id;
      _values.threshold = threshold;
      _values.monitor_object = monitorObjId;
      _values.schedule = {
        type: unit,
        value: values.schedule,
      };
      if (openNoData) {
        _values.no_data_alert = noDataAlert;
        _values.no_data_level = noDataLevel;
      } else {
        _values.no_data_level = '';
      }
      operateStrategy(_values);
    });
  };

  const operateStrategy = async (params: StrategyFields) => {
    try {
      setConfirmLoading(true);
      const msg: string = t(
        type === 'add'
          ? 'common.successfullyAdded'
          : 'common.successfullyModified'
      );
      const url: string =
        type === 'add'
          ? '/api/monitor_policy/'
          : `/api/monitor_policy/${detailId}/`;
      const requestType = type === 'add' ? post : put;
      await requestType(url, params);
      message.success(msg);
      goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Spin spinning={pageLoading} className="w-full">
      <div className={strategyStyle.strategy}>
        <div className={strategyStyle.title}>
          <ArrowLeftOutlined
            className="text-[var(--color-primary)] text-[20px] cursor-pointer mr-[10px]"
            onClick={goBack}
          />
          {type === 'add' ? (
            t('monitor.createPolicy')
          ) : (
            <span>
              {t('monitor.editPolicy')} -{' '}
              <span className="text-[var(--color-text-3)] text-[12px]">
                {detailName}
              </span>
            </span>
          )}
        </div>
        <div className={strategyStyle.form}>
          <Form form={form} name="basic">
            <Steps
              direction="vertical"
              items={[
                {
                  title: t('monitor.basicInformation'),
                  description: (
                    <>
                      <Form.Item<StrategyFields>
                        label={
                          <span className="w-[100px]">{t('common.name')}</span>
                        }
                        name="name"
                        rules={[
                          { required: true, message: t('common.required') },
                        ]}
                      >
                        <Input
                          placeholder={t('common.name')}
                          className="w-[300px]"
                        />
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        label={
                          <span className="w-[100px]">{t('common.group')}</span>
                        }
                        name="organizations"
                        rules={[
                          { required: true, message: t('common.required') },
                        ]}
                      >
                        <Cascader
                          style={{
                            width: '300px',
                          }}
                          placeholder={t('common.group')}
                          className="mr-[8px]"
                          showSearch
                          options={organizationList}
                          allowClear
                        />
                      </Form.Item>
                    </>
                  ),
                  status: 'process',
                },
                {
                  title: t('monitor.defineTheMetric'),
                  description: (
                    <>
                      <Form.Item<StrategyFields>
                        label={
                          <span className="w-[100px]">
                            {t('monitor.source')}
                          </span>
                        }
                        name="source"
                        rules={[{ required: true, validator: validateAssets }]}
                      >
                        <div>
                          <div className="flex">
                            {t('common.select')}
                            <span className="text-[var(--color-primary)] px-[4px]">
                              {source.values.length}
                            </span>
                            {t('monitor.asset')}(s)
                            <Button
                              className="ml-[10px]"
                              icon={<PlusOutlined />}
                              size="small"
                              onClick={openInstModal}
                            ></Button>
                          </div>
                          <div className="text-[var(--color-text-3)] mt-[10px]">
                            {t('monitor.setAssets')}
                          </div>
                        </div>
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        name="metric"
                        label={
                          <span className="w-[100px]">
                            {t('monitor.metric')}
                          </span>
                        }
                        rules={[{ validator: validateMetric, required: true }]}
                      >
                        <div className={strategyStyle.condition}>
                          <Select
                            allowClear
                            style={{
                              width: '300px',
                              margin: '0 10px 10px 0',
                            }}
                            placeholder={t('monitor.metric')}
                            showSearch
                            value={metric}
                            loading={metricsLoading}
                            onChange={handleMetricChange}
                          >
                            {metrics.map((item) => (
                              <Option value={item.name} key={item.name}>
                                {item.display_name}
                              </Option>
                            ))}
                          </Select>
                          <div className={strategyStyle.conditionItem}>
                            {conditions.length ? (
                              <ul className={strategyStyle.conditions}>
                                {conditions.map((conditionItem, index) => (
                                  <li
                                    className={`${strategyStyle.itemOption} ${strategyStyle.filter}`}
                                    key={index}
                                  >
                                    <Select
                                      className={strategyStyle.filterLabel}
                                      placeholder={t('monitor.label')}
                                      showSearch
                                      value={conditionItem.name}
                                      onChange={(val) =>
                                        handleLabelChange(val, index)
                                      }
                                    >
                                      {labels.map((item) => (
                                        <Option value={item} key={item}>
                                          {item}
                                        </Option>
                                      ))}
                                    </Select>
                                    <Select
                                      style={{
                                        width: '100px',
                                      }}
                                      placeholder={t('monitor.term')}
                                      value={conditionItem.method}
                                      onChange={(val) =>
                                        handleConditionChange(val, index)
                                      }
                                    >
                                      {CONDITION_LIST.map((item: ListItem) => (
                                        <Option value={item.id} key={item.id}>
                                          {item.name}
                                        </Option>
                                      ))}
                                    </Select>
                                    <Input
                                      style={{
                                        width: '150px',
                                      }}
                                      placeholder={t('monitor.value')}
                                      value={conditionItem.value}
                                      onChange={(e) =>
                                        handleValueChange(e, index)
                                      }
                                    ></Input>
                                    <Button
                                      icon={<CloseOutlined />}
                                      onClick={() => deleteConditionItem(index)}
                                    />
                                    <Button
                                      icon={<PlusOutlined />}
                                      onClick={addConditionItem}
                                    />
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <Button
                                disabled={!metric}
                                icon={<PlusOutlined />}
                                onClick={addConditionItem}
                              />
                            )}
                          </div>
                        </div>
                        <div className="text-[var(--color-text-3)]">
                          {t('monitor.setDimensions')}
                        </div>
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        required
                        label={
                          <span className="w-[100px]">
                            {t('monitor.frequency')}
                          </span>
                        }
                      >
                        <Form.Item
                          name="schedule"
                          noStyle
                          rules={[
                            { required: true, message: t('common.required') },
                          ]}
                        >
                          <InputNumber
                            min={SCHEDULE_UNIT_MAP[`${unit}Min`]}
                            max={SCHEDULE_UNIT_MAP[`${unit}Max`]}
                            precision={0}
                            addonAfter={
                              <Select
                                value={unit}
                                style={{ width: 120 }}
                                onChange={handleUnitChange}
                              >
                                {SCHEDULE_LIST.map((item) => (
                                  <Option key={item.value} value={item.value}>
                                    {item.label}
                                  </Option>
                                ))}
                              </Select>
                            }
                          />
                        </Form.Item>
                        <div className="text-[var(--color-text-3)] mt-[10px]">
                          {t('monitor.setFrequency')}
                        </div>
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        required
                        label={
                          <span className="w-[100px]">
                            {t('monitor.period')}
                          </span>
                        }
                      >
                        <Form.Item
                          name="period"
                          noStyle
                          rules={[
                            { required: true, message: t('common.required') },
                          ]}
                        >
                          <Select
                            allowClear
                            style={{
                              width: '300px',
                            }}
                            placeholder={t('monitor.period')}
                          >
                            {PERIOD_LIST.map((item: ListItem) => (
                              <Option value={item.value} key={item.value}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div className="text-[var(--color-text-3)] mt-[10px]">
                          {t('monitor.setPeriod')}
                        </div>
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        required
                        label={
                          <span className="w-[100px]">
                            {t('monitor.method')}
                          </span>
                        }
                      >
                        <Form.Item
                          name="algorithm"
                          noStyle
                          rules={[
                            { required: true, message: t('common.required') },
                          ]}
                        >
                          <Select
                            allowClear
                            style={{
                              width: '300px',
                            }}
                            placeholder={t('monitor.method')}
                          >
                            {METHOD_LIST.map((item: ListItem) => (
                              <Option value={item.value} key={item.value}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div className="text-[var(--color-text-3)] mt-[10px]">
                          {t('monitor.setMethod')}
                        </div>
                      </Form.Item>
                    </>
                  ),
                  status: 'process',
                },
                {
                  title: t('monitor.setAlertConditions'),
                  description: (
                    <>
                      <Form.Item<StrategyFields>
                        name="threshold"
                        label={
                          <span className="w-[100px]">
                            {t('monitor.algorithm')}
                          </span>
                        }
                        rules={[
                          { validator: validateThreshold, required: true },
                        ]}
                      >
                        <div className="w-[220px] bg-[var(--color-bg-1)] border shadow-md transition-shadow duration-300 ease-in-out rounded-lg p-3 relative cursor-pointer group">
                          <div className="flex items-center space-x-4 my-1">
                            <Icon
                              type={
                                monitorName === 'Cluster'
                                  ? 'K8S'
                                  : monitorName || ''
                              }
                              className="text-2xl"
                            />
                            <h2 className="text-[16px] font-bold m-0">
                              {t('monitor.threshold')}
                            </h2>
                          </div>
                          <p
                            className={`text-[var(--color-text-3)] text-[13px]`}
                          >
                            {t('monitor.setThreshold')}
                          </p>
                        </div>
                        {threshold.map((item, index) => (
                          <div
                            key={item.level}
                            className="bg-[var(--color-bg-1)] border shadow-sm p-3 mt-[10px] w-[800px]"
                          >
                            <div
                              className="flex items-center space-x-4 my-1 font-[800]"
                              style={{
                                borderLeft: `4px solid ${
                                  LEVEL_MAP[item.level]
                                }`,
                                paddingLeft: '10px',
                              }}
                            >
                              {t(`monitor.${item.level}`)}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-[10px]">
                                {t('monitor.whenResultIs')}
                              </span>
                              <Select
                                className={strategyStyle.filterLabel}
                                style={{
                                  width: '100px',
                                }}
                                value={item.method}
                                placeholder={t('monitor.method')}
                                onChange={(val) => {
                                  handleThresholdMethodChange(val, index);
                                }}
                              >
                                {COMPARISON_METHOD.map((item: ListItem) => (
                                  <Option value={item.value} key={item.value}>
                                    {item.label}
                                  </Option>
                                ))}
                              </Select>
                              <InputNumber
                                style={{
                                  width: '200px',
                                  borderRadius: '0 6px 6px 0',
                                }}
                                min={1}
                                precision={0}
                                value={item.value}
                                onChange={(e) =>
                                  handleThresholdValueChange(e, index)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        required
                        label={
                          <span className="w-[100px]">
                            {t('monitor.recovery')}
                          </span>
                        }
                      >
                        {t('monitor.recoveryCondition')}
                        <Form.Item
                          name="recovery_condition"
                          noStyle
                          rules={[
                            { required: true, message: t('common.required') },
                          ]}
                        >
                          <InputNumber
                            className="mx-[10px] w-[100px]"
                            min={1}
                            precision={0}
                          />
                        </Form.Item>
                        {t('monitor.consecutivePeriods')}
                        <div className="text-[var(--color-text-3)] mt-[10px]">
                          {t('monitor.setRecovery')}
                        </div>
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        name="no_data_alert"
                        label={
                          <span className="w-[100px]">
                            {t('monitor.nodata')}
                          </span>
                        }
                        rules={[{ required: true, validator: validateNoData }]}
                      >
                        <Switch
                          checked={openNoData}
                          onChange={handleNoDataChange}
                        />
                        {openNoData && (
                          <div className="mt-[10px]">
                            {t('monitor.reportedFor')}
                            <InputNumber
                              className="mx-[10px] w-[100px]"
                              min={1}
                              precision={0}
                              onChange={handleNoDataAlertChange}
                              value={noDataAlert}
                            />
                            {t('monitor.nodataPeriods')}
                            <Select
                              value={noDataLevel}
                              style={{
                                width: '100px',
                                marginLeft: '10px',
                              }}
                              placeholder={t('monitor.level')}
                              onChange={(val: string) => setNoDataLevel(val)}
                            >
                              {LEVEL_LIST.map((item: ListItem) => (
                                <Option value={item.value} key={item.value}>
                                  {item.label}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        )}
                      </Form.Item>
                    </>
                  ),
                  status: 'process',
                },
                {
                  title: t('monitor.configureNotifications'),
                  description: (
                    <>
                      <Form.Item<StrategyFields>
                        label={
                          <span className="w-[100px]">
                            {t('monitor.notification')}
                          </span>
                        }
                        name="notice"
                        rules={[
                          { required: true, message: t('common.required') },
                        ]}
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        label={
                          <span className="w-[100px]">
                            {t('monitor.method')}
                          </span>
                        }
                        name="notice_type"
                        rules={[
                          { required: true, message: t('common.required') },
                        ]}
                      >
                        <Radio.Group>
                          <Radio value="email">{t('monitor.email')}</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item<StrategyFields>
                        label={
                          <span className="w-[100px]">
                            {t('monitor.notifier')}
                          </span>
                        }
                        name="notice_users"
                        rules={[
                          { required: true, message: t('common.required') },
                        ]}
                      >
                        <Select
                          style={{
                            width: '300px',
                          }}
                          showSearch
                          allowClear
                          mode="tags"
                          maxTagCount="responsive"
                          placeholder={t('monitor.notifier')}
                        >
                          {userList.map((item) => (
                            <Option value={item.id} key={item.id}>
                              {item.username}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  ),
                  status: 'process',
                },
              ]}
            />
          </Form>
        </div>
        <div className={strategyStyle.footer}>
          <Button
            type="primary"
            className="mr-[10px]"
            loading={confirmLoading}
            onClick={createStrategy}
          >
            {t('common.confirm')}
          </Button>
          <Button onClick={goBack}>{t('common.cancel')}</Button>
        </div>
      </div>
      <SelectAssets
        ref={instRef}
        organizationList={organizationList}
        form={source}
        monitorObject={monitorObjId}
        onSuccess={onChooseAssets}
      />
    </Spin>
  );
};

export default StrategyOperation;
