'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  Input,
  Button,
  Form,
  message,
  Select,
  Cascader,
  InputNumber,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { ModalRef, ListItem, CascaderItem } from '@/types';
import { MetricInfo, DimensionItem, EnumItem } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone, findCascaderPath } from '@/utils/common';
import { UNIT_LIST } from '@/constants/monitor';
const { Option } = Select;

interface ModalProps {
  onSuccess: () => void;
  groupList: ListItem[];
  monitorObject: number;
  pluginId: number;
}

const MetricModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess, groupList, monitorObject, pluginId }, ref) => {
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
    const [enumList, setEnumList] = useState<EnumItem[]>([
      { id: null, name: null },
    ]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form, title }) => {
        // 开启弹窗的交互
        const formData = deepClone(form);
        setGroupVisible(true);
        setType(type);
        setTitle(title);
        try {
          if (type === 'add') {
            formData.type = 'metric';
            setDimensions([{ name: '' }]);
            setEnumList([{ name: null, id: null }]);
          } else {
            setDimensions(
              formData.dimensions?.length ? formData.dimensions : [{ name: '' }]
            );
            if (formData.data_type === 'Number') {
              formData.unit = findCascaderPath(unitList.current, formData.unit);
            } else {
              formData.data_type = 'Enum';
              const _enumList = JSON.parse(formData.unit);
              setEnumList(_enumList);
            }
          }
          setGroupForm(formData);
        } catch (error) {
          setGroupForm(formData);
          setEnumList([{ name: null, id: null }]);
        }
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
          monitor_plugin: pluginId,
          type: 'metric',
          unit:
            values.data_type === 'Enum'
              ? JSON.stringify(enumList)
              : values.unit.at(-1),
        });
      });
    };

    const addDimension = () => {
      const _dimensions = deepClone(dimensions);
      _dimensions.push({ name: '' });
      setDimensions(_dimensions);
    };

    const addEnumItem = () => {
      const _enumList = deepClone(enumList);
      _enumList.push({ name: null, id: null });
      setEnumList(_enumList);
    };

    const handleCancel = () => {
      setGroupVisible(false);
    };

    // 自定义验证枚举列表
    const validateEnumList = async () => {
      if (
        enumList.length &&
        enumList.some((item) => {
          return Object.values(item).some((tex) => !tex && tex !== 0);
        })
      ) {
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

    const handleEnumIdChange = (val: number | null, index: number) => {
      const _enumList = deepClone(enumList);
      _enumList[index].id = val;
      setEnumList(_enumList);
    };

    const handleEnumNameChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const _enumList = deepClone(enumList);
      _enumList[index].name = e.target.value;
      setEnumList(_enumList);
    };

    const deleteDimensiontem = (index: number) => {
      const _dimensions = deepClone(dimensions);
      _dimensions.splice(index, 1);
      setDimensions(_dimensions);
    };

    const deleteEnumItem = (index: number) => {
      const _enumList = deepClone(enumList);
      _enumList.splice(index, 1);
      setEnumList(_enumList);
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
                    {item.display_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('monitor.intergrations.dimension')}
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
              label={t('monitor.intergrations.formula')}
              name="query"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item<MetricInfo>
              label={t('monitor.intergrations.dataType')}
              name="data_type"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select>
                <Option value="Number">
                  {t('monitor.intergrations.number')}
                </Option>
                <Option value="Enum">{t('monitor.intergrations.enum')}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.data_type !== currentValues.data_type
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('data_type') === 'Number' ? (
                  <Form.Item<MetricInfo>
                    label={t('common.unit')}
                    name="unit"
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <Cascader showSearch options={unitList.current} />
                  </Form.Item>
                ) : (
                  <Form.Item<MetricInfo>
                    label={t('common.unit')}
                    name="unit"
                    rules={[{ required: true, validator: validateEnumList }]}
                  >
                    <ul>
                      <li className="mb-[6px] text-[var(--color-text-3)] font-[600]">
                        <div className="w-[80%] flex justify-between">
                          <span className="w-[160px]">
                            {t('monitor.intergrations.originalValue')}
                          </span>
                          <span className="w-[160px]">
                            {t('monitor.intergrations.mappedValue')}
                          </span>
                        </div>
                      </li>
                      {enumList.map((item, index) => (
                        <li
                          className={`flex ${
                            index + 1 !== enumList?.length && 'mb-[10px]'
                          }`}
                          key={index}
                        >
                          <div className="w-[80%] flex justify-between">
                            <InputNumber
                              placeholder={t(
                                'monitor.intergrations.originalValue'
                              )}
                              className="w-[160px]"
                              min={0}
                              value={item.id}
                              onChange={(e) => handleEnumIdChange(e, index)}
                            />
                            <Input
                              placeholder={t(
                                'monitor.intergrations.mappedValue'
                              )}
                              className="w-[160px]"
                              value={item.name as string}
                              onChange={(e) => {
                                handleEnumNameChange(e, index);
                              }}
                            />
                          </div>
                          <Button
                            icon={<PlusOutlined />}
                            className="ml-[10px]"
                            onClick={addEnumItem}
                          ></Button>
                          {!!index && (
                            <Button
                              icon={<MinusOutlined />}
                              className="ml-[10px]"
                              onClick={() => deleteEnumItem(index)}
                            ></Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Form.Item>
                )
              }
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
