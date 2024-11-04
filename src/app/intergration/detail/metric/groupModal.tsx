'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Button, Form, message } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { ModalRef } from '@/types';
import { GroupInfo } from '@/types/monitor';
import { useTranslation } from '@/utils/i18n';

interface GroupModalProps {
  onSuccess: () => void;
}

const GroupMoadal = forwardRef<ModalRef, GroupModalProps>(
  ({ onSuccess }, ref) => {
    const { post, put } = useApiClient();
    const { t } = useTranslation();
    const formRef = useRef<FormInstance>(null);
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [groupForm, setGroupForm] = useState<GroupInfo>({});
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState<string>('');

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form, title }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setType(type);
        setTitle(title);
        setGroupForm(form);
      },
    }));

    useEffect(() => {
      if (groupVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(groupForm);
      }
    }, [groupVisible, groupForm]);

    const operateGroup = async (params: GroupInfo) => {
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
            <Form.Item<GroupInfo>
              label="ID"
              name="id"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input disabled={type === 'edit'} />
            </Form.Item>
            <Form.Item<GroupInfo>
              label="Name"
              name="name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
GroupMoadal.displayName = 'GroupMoadal';
export default GroupMoadal;