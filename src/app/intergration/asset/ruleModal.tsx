'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Button, Form, message, Radio, Cascader } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { ModalRef, ListItem } from '@/types';
import { RuleInfo, DimensionItem } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/utils/common';

interface ModalProps {
  onSuccess: () => void;
  groupList: ListItem[];
  monitorObject: React.Key;
}

const RuleModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess, groupList, monitorObject }, ref) => {
    const { post, put } = useApiClient();
    const { t } = useTranslation();
    const formRef = useRef<FormInstance>(null);
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [groupForm, setGroupForm] = useState<RuleInfo>({});
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
          formData.type = 'select';
          setDimensions([{ name: '' }]);
        } else {
          if (formData.grouping_rules.query) {
            formData.grouping_rules = formData.grouping_rules.query;
          }
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

    const operateGroup = async (params: RuleInfo) => {
      try {
        setConfirmLoading(true);
        const msg: string = t(
          type === 'add'
            ? 'common.successfullyAdded'
            : 'common.successfullyModified'
        );
        const url: string =
          type === 'add'
            ? '/api/monitor_instance_group_rule/'
            : `/api/monitor_instance_group_rule/${groupForm.id}/`;
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
          monitor_object: monitorObject,
          grouping_rules: {
            query: values.grouping_rules,
          },
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
            <Form.Item<RuleInfo>
              label={t('common.name')}
              name="name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<RuleInfo>
              label={t('common.type')}
              name="type"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Radio.Group>
                <Radio value="select">{t('common.select')}</Radio>
                <Radio value="condition">{t('monitor.condition')}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.type !== currentValues.type
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('type') === 'select' ? (
                  <Form.Item<RuleInfo>
                    label={t('monitor.asset')}
                    name="grouping_rules"
                    rules={[{ required: true, validator: validateDimensions }]}
                  >
                    <div>select 2 assets</div>
                  </Form.Item>
                ) : (
                  <Form.Item<RuleInfo>
                    label={t('monitor.condition')}
                    name="grouping_rules"
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <Input />
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item<RuleInfo>
              label={t('common.group')}
              name="organizations"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Cascader multiple showSearch options={groupList} />
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
RuleModal.displayName = 'RuleModal';
export default RuleModal;
