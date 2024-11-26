import React from 'react';
import { TooltipProps } from 'recharts';
import customTooltipStyle from './index.module.less';
import dayjs from 'dayjs';
interface CustomToolTipProps extends Omit<TooltipProps<any, string>, 'unit'> {
  unit?: string;
  visible?: boolean;
}

const CustomTooltip: React.FC<CustomToolTipProps> = ({
  active,
  payload,
  label,
  unit = '',
  visible = true,
}) => {
  if (active && payload?.length && visible) {
    return (
      <div className={customTooltipStyle.customTooltip}>
        <p className="label font-[600]">{`${dayjs
          .unix(label)
          .format('YYYY-MM-DD HH:mm:ss')}`}</p>
        {payload.map((item: any, index: number) => (
          <div key={index}>
            <div className="flex items-center mt-[4px]">
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  marginRight: '5px',
                }}
              ></span>
              {item.payload.title}
              <span className="font-[600] ml-[10px]">
                {typeof item.value === 'number'
                  ? item.value.toFixed(2)
                  : item.value}
              </span>
            </div>
            <ul className="text-[12px] ml-[15px] text-[var(--color-text-3)]">
              {(item.payload.details?.[item.dataKey] || [])
                .filter((item: any) => item.name !== 'instance_name')
                .map((detail: any) => (
                  <li className="mt-[5px]" key={detail.name}>
                    <span>{`${detail.label}: ${detail.value}`}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;