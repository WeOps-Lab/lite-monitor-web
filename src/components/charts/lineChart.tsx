import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import CustomTooltip from './customTooltips';
import { generateUniqueRandomColor, formatTime } from '@/utils/common';
import chartLineStyle from './index.module.less';
import dayjs from 'dayjs';
import DimensionFilter from './dimensionFilter';

interface LineChartProps {
  data: any[];
  unit?: string;
  showDimensionFilter?: boolean;
  onXRangeChange?: (arr: any[]) => void;
}

const getChartAreaKeys = (arr: any[]) => {
  const keys = new Set();
  arr.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (key.includes('value')) {
        keys.add(key);
      }
    });
  });
  return Array.from(keys);
};

const getDetials = (arr: any[]) => {
  return arr.reduce((pre, cur) => {
    return Object.assign(pre, cur.details);
  }, {});
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  unit = '',
  showDimensionFilter = false,
  onXRangeChange,
}) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [endX, setEndX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // 生成颜色并存储在状态中
  const [colors, setColors] = useState<string[]>([]);
  const [visibleAreas, setVisibleAreas] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    const chartKeys = getChartAreaKeys(data);
    const chartDetails = getDetials(data);
    setDetails(chartDetails);
    setVisibleAreas(chartKeys); // 默认显示所有area
    if (colors.length) return;
    const generatedColors = chartKeys.map(() => generateUniqueRandomColor());
    setColors(generatedColors);
  }, [data]);

  const handleMouseDown = (e: any) => {
    setStartX(e.activeLabel || null);
    setIsDragging(true);
  };

  const handleMouseMove = (e: any) => {
    if (isDragging) {
      setEndX(e.activeLabel || null);
    } else {
      setActiveIndex(e.activeTooltipIndex || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!!startX && !!endX) {
      const selectedTimeRange = [
        dayjs(Math.min(startX, endX) * 1000),
        dayjs(Math.max(startX, endX) * 1000),
      ];
      onXRangeChange && onXRangeChange(selectedTimeRange);
    }
    setStartX(null);
    setEndX(null);
  };

  // 获取数据中的最小和最大时间
  const times = data.map((d) => d.time);
  const minTime = +new Date(Math.min(...times));
  const maxTime = +new Date(Math.max(...times));

  const handleLegendClick = (key: any) => {
    setVisibleAreas((prevVisibleAreas) =>
      prevVisibleAreas.includes(key)
        ? prevVisibleAreas.filter((area) => area !== key)
        : [...prevVisibleAreas, key]
    );
  };

  return (
    <div className="flex w-full h-full">
      <ResponsiveContainer className={chartLineStyle.chart}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <XAxis
            dataKey="time"
            tick={{ fill: 'var(--color-text-3)', fontSize: 14 }}
            tickFormatter={(tick) => formatTime(tick, minTime, maxTime)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-3)', fontSize: 14 }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip
            content={<CustomTooltip unit={unit} visible={!isDragging} />}
          />
          {getChartAreaKeys(data).map((key, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={key as any}
              stroke={colors[index]}
              fillOpacity={0}
              fill={colors[index]}
              hide={!visibleAreas.includes(key)}
            />
          ))}
          {isDragging && !!startX && !!endX && (
            <ReferenceArea
              x1={Math.min(startX, endX)}
              x2={Math.max(startX, endX)}
              strokeOpacity={0.3}
              fill="rgba(0, 0, 255, 0.1)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      {showDimensionFilter && (
        <DimensionFilter
          data={data}
          colors={colors}
          visibleAreas={visibleAreas}
          details={details}
          onLegendClick={handleLegendClick}
        />
      )}
    </div>
  );
};

export default LineChart;
