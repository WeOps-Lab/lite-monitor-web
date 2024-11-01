import React from 'react';
import { TooltipProps } from 'recharts';

const CustomTooltip: React.FC<TooltipProps<any, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          fontSize: '14px',
          backgroundColor: 'var(--color-bg-1)',
          border: '1px solid var(--color-border-1)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <p className="label font-[600]">{`${label}`}</p>
        <div className="intro flex items-center mt-[4px]">
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              backgroundColor: payload[0].color,
              borderRadius: '50%',
              marginRight: '5px',
            }}
          ></span>
          {payload[0].payload.title}
          <span className="font-[600] ml-[10px]">{`${payload[0].value}%`}</span>
        </div>
        {payload[1] && (
          <div className="intro flex items-center mt-[4px]">
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                backgroundColor: payload[1].color,
                borderRadius: '50%',
                marginRight: '5px',
              }}
            ></span>
            {payload[1].payload.title}
            <span className="font-[600] ml-[10px]">{`${payload[1].value}%`}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
