import React from 'react';

interface SingleValueDisplayProps {
  value: number | string;
  unit?: string;
  label?: string;
  color?: string;
  fontSize?: number; // 新增属性，用于控制字体大小
  unitFontSize?: number; // 新增属性，用于控制单位的字体大小
  labelFontSize?: number; // 新增属性，用于控制标签的字体大小
}

const SingleValueDisplay: React.FC<SingleValueDisplayProps> = ({
  value,
  unit,
  label,
  color = 'var(--color-text-1)',
  fontSize = 24, // 默认字体大小
  unitFontSize = 16, // 默认单位字体大小
  labelFontSize = 14, // 默认标签字体大小
}) => {
  return (
    <div className="bg-[var(--color-bg-1)]">
      <div
        className="flex items-center justify-center font-bold"
        style={{ color, fontSize }}
      >
        {value}
        {unit && (
          <span className="ml-[4px]" style={{ fontSize: unitFontSize }}>
            {unit}
          </span>
        )}
      </div>
      {label && (
        <div
          className="flex items-center justify-center text-[var(--color-text-3)] mt-[10px]"
          style={{ fontSize: labelFontSize }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default SingleValueDisplay;
