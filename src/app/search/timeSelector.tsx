import React, { useState } from 'react';
import Icon from '@/components/icon';
import { Select, Button, TimeRangePickerProps, DatePicker } from 'antd';
import type { SelectProps } from 'antd';
type LabelRender = SelectProps['labelRender'];
import { FREQUENCY_LIST } from '@/constants/monitor';
import { ReloadOutlined } from '@ant-design/icons';
import timeSelectorStyle from './index.module.less';
const { RangePicker } = DatePicker;

interface TimeSelectorProps
  extends Omit<
    TimeRangePickerProps,
    'showTime' | 'format' | 'onFrequenceChange' | 'onRefresh'
  > {
  showTime?: boolean;
  format?: string;
  onFrequenceChange: (frequence: number) => void;
  onRefresh: () => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  showTime = true,
  format = 'YYYY-MM-DD HH:mm:ss',
  onFrequenceChange,
  onRefresh,
  ...TimeRangePickerProps
}) => {
  const [frequency, setFrequency] = useState<number>(0);

  const labelRender: LabelRender = (props) => {
    const { label } = props;
    return (
      <div className="flex items-center">
        <Icon type="zidongshuaxin" className="mr-[4px] text-[16px]" />
        {label}
      </div>
    );
  };

  const handleFrequencyChange = (val: number) => {
    setFrequency(val);
    onFrequenceChange(val);
  };

  return (
    <div className={timeSelectorStyle.timeSelector}>
      <RangePicker
        showTime={showTime}
        format={format}
        {...TimeRangePickerProps}
      />
      <div className={`${timeSelectorStyle.refreshBox} flex ml-[8px]`}>
        <Button
          className={timeSelectorStyle.refreshBtn}
          icon={<ReloadOutlined />}
          onClick={onRefresh}
        ></Button>
        <Select
          className={`w-[100px] ${timeSelectorStyle.frequence}`}
          value={frequency}
          options={FREQUENCY_LIST}
          labelRender={labelRender}
          onChange={handleFrequencyChange}
        ></Select>
      </div>
    </div>
  );
};

export default TimeSelector;
