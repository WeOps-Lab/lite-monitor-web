'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Button, Form, message, Radio, Select, Cascader } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { ModalRef, ListItem, CascaderItem } from '@/types';
import { MetricInfo, DimensionItem } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone, findCascaderPath } from '@/utils/common';
import { UNIT_LIST } from '@/constants/monitor';
const { Option } = Select;

interface ModalProps {
  onSuccess: () => void;
  groupList: ListItem[];
  monitorObject: number;
}

const MetricModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess, groupList, monitorObject }, ref) => {
    const { post, put } = useApiClient();
    const { t } = useTranslation();
    const formRef = useRef<FormInstance>(null);
    const unitList = useRef<CascaderItem[]>(
      deepClone(UNIT_LIST).map((item: CascaderItem) => ({
        ...item,
        value: item.label,
      }))
    );
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [groupForm, setGroupForm] = useState<MetricInfo>({});
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [dimensions, setDimensions] = useState<DimensionItem[]>([
      { name: '' },
    ]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form, title }) => {
        // 开启弹窗的交互
        const formData = deepClone(form);
        setGroupVisible(true);
        setType(type);
        setTitle(title);
        if (type === 'add') {
          formData.type = 'metric';
          setDimensions([{ name: '' }]);
        } else {
          setDimensions(
            formData.dimensions?.length ? formData.dimensions : [{ name: '' }]
          );
          formData.unit = findCascaderPath(unitList.current, formData.unit);
        }
        setGroupForm(formData);
      },
    }));

    useEffect(() => {
      if (groupVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(groupForm);
      }
    }, [groupVisible, groupForm]);

    const operateGroup = async (params: MetricInfo) => {
      try {
        setConfirmLoading(true);
        const msg: string = t(
          type === 'add'
            ? 'common.successfullyAdded'
            : 'common.successfullyModified'
        );
        const url: string =
          type === 'add' ? '/api/metrics/' : `/api/metrics/${groupForm.id}/`;
        const requestType = type === 'add' ? post : put;
        await requestType(url, params);
        message.success(msg);
        handleCancel();
        onSuccess();
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    };

    const handleSubmit = () => {
      formRef.current?.validateFields().then((values) => {
        operateGroup({
          ...values,
          dimensions: dimensions.some((item) => !item.name) ? [] : dimensions,
          monitor_object: monitorObject,
          type: 'metric',
          unit: values.unit.at(-1),
        });
      });
    };

    const addDimension = () => {
      const _dimensions = deepClone(dimensions);
      _dimensions.push({ name: '' });
      setDimensions(_dimensions);
    };

    const handleCancel = () => {
      setGroupVisible(false);
    };

    // 自定义验证枚举列表
    const validateDimensions = async () => {
      if (dimensions.some((item) => !item.name)) {
        return Promise.reject(new Error(t('common.valueValidate')));
      }
      return Promise.resolve();
    };

    const onDimensionValChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const _dimensions = deepClone(dimensions);
      _dimensions[index].name = e.target.value;
      setDimensions(_dimensions);
    };

    const deleteDimensiontem = (index: number) => {
      const _dimensions = deepClone(dimensions);
      _dimensions.splice(index, 1);
      setDimensions(_dimensions);
    };

    return (
      <div>
        <OperateModal
          width={600}
          title={title}
          visible={groupVisible}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {t('common.confirm')}
              </Button>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <Form
            ref={formRef}
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            {/* <Form.Item<MetricInfo>
              label={t('common.type')}
              name="type"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Radio.Group>
                <Radio value="metric">{t('monitor.metric')}</Radio>
                <Radio value="calculated_metric">
                  {t('monitor.calculatedMetric')}
                </Radio>
              </Radio.Group>
            </Form.Item> */}
            {/* <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.type !== currentValues.type
              }
            >
              <Form.Item<MetricInfo>
                label={t('common.id')}
                name="name"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input disabled={type === 'edit'} />
              </Form.Item>
            </Form.Item> */}
            <Form.Item<MetricInfo>
              label={t('common.id')}
              name="name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input disabled={type === 'edit'} />
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('common.name')}
              name="display_name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('common.group')}
              name="metric_group"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select>
                {groupList.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('monitor.dimension')}
              name="dimensions"
            >
              <ul>
                {dimensions.map((item, index) => (
                  <li
                    className={`flex ${
                      index + 1 !== dimensions?.length && 'mb-[10px]'
                    }`}
                    key={index}
                  >
                    <Input
                      className="w-[80%]"
                      value={item.name}
                      onChange={(e) => {
                        onDimensionValChange(e, index);
                      }}
                    />
                    <Button
                      icon={<PlusOutlined />}
                      className="ml-[10px]"
                      onClick={addDimension}
                    ></Button>
                    {!!index && (
                      <Button
                        icon={<MinusOutlined />}
                        className="ml-[10px]"
                        onClick={() => deleteDimensiontem(index)}
                      ></Button>
                    )}
                  </li>
                ))}
              </ul>
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('monitor.formula')}
              name="query"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            {/* <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.type !== currentValues.type
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('type') === 'metric' ? (
                  <Form.Item<MetricInfo>
                    label={t('monitor.dataType')}
                    name="data_type"
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <Select>
                      <Option value="number">{t('monitor.number')}</Option>
                      <Option value="enum">{t('monitor.enum')}</Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item> */}
            <Form.Item<MetricInfo>
              label={t('monitor.dataType')}
              name="data_type"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select>
                <Option value="number">{t('monitor.number')}</Option>
                <Option value="enum">{t('monitor.enum')}</Option>
              </Select>
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('common.unit')}
              name="unit"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Cascader showSearch options={unitList.current} />
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('common.description')}
              name="description"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
MetricModal.displayName = 'MetricModal';
export default MetricModal;
