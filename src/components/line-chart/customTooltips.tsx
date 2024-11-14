import React from 'react';
import { TooltipProps } from 'recharts';
import customTooltipStyle from './index.module.less';

const CustomTooltip: React.FC<TooltipProps<any, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload?.length) {
    return (
      <div className={customTooltipStyle.customTooltip}>
        <p className="label font-[600]">{`${label}`}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="intro flex items-center mt-[4px]">
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
            <span className="font-[600] ml-[10px]">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
