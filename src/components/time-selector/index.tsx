import React, { useState } from 'react';
import Icon from '@/components/icon';
import { Select, Button, TimeRangePickerProps, DatePicker } from 'antd';
import type { SelectProps } from 'antd';
type LabelRender = SelectProps['labelRender'];
import { FREQUENCY_LIST } from '@/constants/monitor';
import { ReloadOutlined } from '@ant-design/icons';
import timeSelectorStyle from './index.module.less';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';

const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 5 Hours', value: [dayjs().add(-5, 'h'), dayjs()] },
  { label: 'Last 12 Hours', value: [dayjs().add(-12, 'h'), dayjs()] },
  { label: 'Last 1 Day', value: [dayjs().add(-1, 'd'), dayjs()] },
  { label: 'Last 5 Days', value: [dayjs().add(-5, 'd'), dayjs()] },
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
];

interface TimeSelectorProps
  extends Omit<
    TimeRangePickerProps,
    'showTime' | 'format' | 'onFrequenceChange' | 'onRefresh'
  > {
  showTime?: boolean;
  format?: string;
  onlyRefresh?: boolean;
  onFrequenceChange: (frequence: number) => void;
  onRefresh: () => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  showTime = true,
  format = 'YYYY-MM-DD HH:mm:ss',
  onlyRefresh = false,
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
      {!onlyRefresh && (
        <RangePicker
          presets={rangePresets}
          showTime={showTime}
          format={format}
          {...TimeRangePickerProps}
        />
      )}
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
