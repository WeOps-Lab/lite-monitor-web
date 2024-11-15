import React from 'react';
import { TooltipProps } from 'recharts';
import customTooltipStyle from './index.module.less';
interface CustomToolTipProps extends Omit<TooltipProps<any, string>, 'unit'> {
  unit?: string;
}

const CustomTooltip: React.FC<CustomToolTipProps> = ({
  active,
  payload,
  label,
  unit = '',
}) => {
  if (active && payload?.length) {
    return (
      <div className={customTooltipStyle.customTooltip}>
        <p className="label font-[600]">{`${label}`}</p>
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
                {item.value}
                {unit}
              </span>
            </div>
            <ul className="text-[12px] ml-[15px] text-[var(--color-text-3)]">
              {(item.payload.dimensions || []).map((dimen: any) => (
                <li className="mt-[5px]" key={dimen.name}>
                  <span>{`${dimen.label}: ${dimen.value}`}</span>
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
