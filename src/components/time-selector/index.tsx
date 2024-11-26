import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/icon';
import { Select, Button, DatePicker } from 'antd';
import { CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SelectProps, TimeRangePickerProps } from 'antd';
import { FREQUENCY_LIST, TIME_RANGE_LIST } from '@/constants/monitor';
import timeSelectorStyle from './index.module.less';
import dayjs, { Dayjs } from 'dayjs';
type LabelRender = SelectProps['labelRender'];
const { RangePicker } = DatePicker;

interface TimeSelectorProps {
  showTime?: boolean;
  format?: string;
  onlyRefresh?: boolean;
  value?: {
    timeRangeValue: number;
    timesValue: [Dayjs, Dayjs] | null;
  };
  onFrequenceChange: (frequence: number) => void;
  onRefresh: () => void;
  onChange?: (range: number[]) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  showTime = true,
  format = 'YYYY-MM-DD HH:mm:ss',
  onlyRefresh = false,
  value = {
    timeRangeValue: 15,
    timesValue: null,
  },
  onFrequenceChange,
  onRefresh,
  onChange,
}) => {
  const [frequency, setFrequency] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<number>(15);
  const [rangePickerOpen, setRangePickerOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [times, setTimes] = useState<[Dayjs, Dayjs] | null>(value.timesValue);

  useEffect(() => {
    if (value.timeRangeValue !== timeRange) {
      setTimeRange(value.timeRangeValue);
    }
  }, [value.timeRangeValue]);

  useEffect(() => {
    if (JSON.stringify(value.timesValue) !== JSON.stringify(times)) {
      setTimes(value.timesValue);
    }
  }, [value.timesValue]);

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

  const handleRangePickerOpenChange = (open: boolean) => {
    setRangePickerOpen(open);
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    setDropdownOpen(open);
  };

  const handleIconClick = () => {
    if (selectRef.current) {
      const selectDom = selectRef.current.querySelector('.ant-select-selector');
      if (selectDom) {
        (selectDom as HTMLElement).click();
        const flag =
          !!document.querySelector('.ant-select-dropdown-hidden') ||
          !document.querySelector('.ant-select-dropdown');
        setDropdownOpen(flag);
      }
    }
  };

  const handleRangePickerChange: TimeRangePickerProps['onChange'] = (value) => {
    if (value) {
      const rangeTime = value.map((item) => dayjs(item).valueOf());
      onChange && onChange(rangeTime);
      setTimes(value as [Dayjs, Dayjs]);
      return;
    }
    const rangeTime = [
      dayjs().subtract(15, 'minute').valueOf(),
      dayjs().valueOf(),
    ];
    onChange && onChange(rangeTime);
    setTimeRange(15);
  };

  const handleRangePickerOk: TimeRangePickerProps['onOk'] = (value) => {
    if (value && value.every((item) => !!item)) {
      setTimeRange(0);
    }
  };

  const handleTimeRangeChange = (value: number) => {
    if (!value) {
      setRangePickerOpen(true);
      return;
    }
    setTimes(null);
    setTimeRange(value);
    const rangeTime = [
      dayjs().subtract(value, 'minute').valueOf(),
      dayjs().valueOf(),
    ];
    onChange && onChange(rangeTime);
  };

  return (
    <div className={timeSelectorStyle.timeSelector}>
      {!onlyRefresh && (
        <div className={timeSelectorStyle.customSlect} ref={selectRef}>
          <Select
            className={`w-[350px] ${timeSelectorStyle.frequence}`}
            value={timeRange}
            options={TIME_RANGE_LIST}
            open={dropdownOpen}
            onChange={handleTimeRangeChange}
            onDropdownVisibleChange={handleDropdownVisibleChange}
          />
          <RangePicker
            style={{
              zIndex: rangePickerOpen || !timeRange ? 1 : -1,
            }}
            className={`w-[350px] ${timeSelectorStyle.rangePicker}`}
            open={rangePickerOpen}
            showTime={showTime}
            format={format}
            value={times}
            onOpenChange={handleRangePickerOpenChange}
            onChange={handleRangePickerChange}
            onOk={handleRangePickerOk}
          />
          <CalendarOutlined
            className={timeSelectorStyle.calenIcon}
            onClick={handleIconClick}
          />
        </div>
      )}
      <div className={`${timeSelectorStyle.refreshBox} flex ml-[8px]`}>
        <Button
          className={timeSelectorStyle.refreshBtn}
          icon={<ReloadOutlined />}
          onClick={onRefresh}
        />
        <Select
          className={`w-[100px] ${timeSelectorStyle.frequence}`}
          value={frequency}
          options={FREQUENCY_LIST}
          labelRender={labelRender}
          onChange={handleFrequencyChange}
        />
      </div>
    </div>
  );
};

export default TimeSelector;
