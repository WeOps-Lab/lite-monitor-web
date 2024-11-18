import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './customTooltips';
import { generateUniqueRandomColor, formatTime } from '@/utils/common';
import chartLineStyle from './index.module.less';

interface LineChartProps {
  data: any[];
  unit?: string;
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

const LineChart: React.FC<LineChartProps> = ({ data, unit = '' }) => {
  // 获取数据中的最小和最大时间
  const times = data.map((d) => d.time);
  const minTime = +new Date(Math.min(...times));
  const maxTime = +new Date(Math.max(...times));
  return (
    <ResponsiveContainer className={chartLineStyle.chartLine}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 0,
          left: 0,
          bottom: 0,
        }}
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
          wrapperClassName="custom-TIPS"
          content={<CustomTooltip unit={unit} />}
        />
        {getChartAreaKeys(data).map((key, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={`value${index + 1}`}
            stroke={generateUniqueRandomColor()}
            fillOpacity={0.01}
            fill={generateUniqueRandomColor()}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
