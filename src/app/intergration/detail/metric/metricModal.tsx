'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Button, Form, message, Radio, Select } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { ModalRef } from '@/types';
import { MetricInfo } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/utils/common';
const { Option } = Select;

interface ModalProps {
  onSuccess: () => void;
}

const MetricModal = forwardRef<ModalRef, ModalProps>(({ onSuccess }, ref) => {
  const { post, put } = useApiClient();
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const [groupVisible, setGroupVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [groupForm, setGroupForm] = useState<MetricInfo>({});
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('');

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form, title }) => {
      // 开启弹窗的交互
      const formData = deepClone(form);
      setGroupVisible(true);
      setType(type);
      setTitle(title);
      if (type === 'add') {
        formData.type = 'metric';
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
        type === 'add' ? 'successfullyAdded' : 'successfullyModified'
      );
      const url: string =
        type === 'add'
          ? '/api/classification/'
          : `/api/classification/${groupForm._id}/`;
      let requestParams = params;
      if (type !== 'add') {
        requestParams = {
          name: params.name,
        };
      }
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
      operateGroup(values);
    });
  };

  const handleCancel = () => {
    setGroupVisible(false);
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
          wrapperCol={{ span: 20 }}
        >
          <Form.Item<MetricInfo>
            label="ID"
            name="id"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input disabled={type === 'edit'} />
          </Form.Item>
          <Form.Item<MetricInfo>
            label="Name"
            name="name"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<MetricInfo>
            label="Group"
            name="group"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<MetricInfo>
            label="Type"
            name="type"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Radio.Group>
              <Radio value="metric">Metric</Radio>
              <Radio value="calculated">Calculated Metric</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'metric' ? (
                <Form.Item<MetricInfo>
                  label="Query"
                  name="query"
                  rules={[{ required: true, message: t('common.required') }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              ) : (
                <Form.Item<MetricInfo>
                  label="Formula"
                  name="formula"
                  rules={[{ required: true, message: t('common.required') }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item<MetricInfo>
            label="Data Type"
            name="dataType"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select placeholder="Please select a country">
              <Option value="china">China</Option>
              <Option value="usa">U.S.A</Option>
            </Select>
          </Form.Item>
          <Form.Item<MetricInfo>
            label="Unit"
            name="unit"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select placeholder="Please select a country">
              <Option value="china">China</Option>
              <Option value="usa">U.S.A</Option>
            </Select>
          </Form.Item>
          <Form.Item<MetricInfo>
            label="Descripition "
            name="descripition"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
});
MetricModal.displayName = 'MetricModal';
export default MetricModal;
