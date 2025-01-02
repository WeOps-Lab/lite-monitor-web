import React, { useState, useEffect } from 'react';
import { Empty } from 'antd';
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
import {
  generateUniqueRandomColor,
  formatTime,
  isStringArray,
} from '@/utils/common';
import chartLineStyle from './index.module.less';
import dayjs, { Dayjs } from 'dayjs';
import DimensionFilter from './dimensionFilter';
import { ChartData, ListItem } from '@/types';
import { MetricItem } from '@/types/monitor';

interface LineChartProps {
  data: ChartData[];
  unit?: string;
  metric?: MetricItem;
  showDimensionFilter?: boolean;
  allowSelect?: boolean;
  onXRangeChange?: (arr: [Dayjs, Dayjs]) => void;
}

const getChartAreaKeys = (arr: ChartData[]): string[] => {
  const keys = new Set<string>();
  arr.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (key.includes('value')) {
        keys.add(key);
      }
    });
  });
  return Array.from(keys);
};

const getDetails = (arr: ChartData[]): Record<string, any> => {
  return arr.reduce((pre, cur) => {
    return Object.assign(pre, cur.details);
  }, {});
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  unit = '',
  showDimensionFilter = false,
  metric = {},
  allowSelect = true,
  onXRangeChange,
}) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [endX, setEndX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [visibleAreas, setVisibleAreas] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [hasDimension, setHasDimension] = useState<boolean>(false);
  // 获取数据中的最小和最大时间
  const times = data.map((d) => d.time);
  const minTime = +new Date(Math.min(...times));
  const maxTime = +new Date(Math.max(...times));

  useEffect(() => {
    const chartKeys = getChartAreaKeys(data);
    const chartDetails = getDetails(data);
    setHasDimension(
      !Object.values(chartDetails || {}).every((item) => !item.length)
    );
    setDetails(chartDetails);
    setVisibleAreas(chartKeys); // 默认显示所有area
    if (colors.length) return;
    const generatedColors = chartKeys.map(() => generateUniqueRandomColor());
    setColors(generatedColors);
  }, [data]);

  useEffect(() => {
    if (!allowSelect) return;
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseUp(e);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, endX]);

  const handleMouseDown = (e: any) => {
    if (!allowSelect) return;
    setStartX((pre) => e.activeLabel || pre);
    setIsDragging(true);
    document.body.style.userSelect = 'none'; // 禁用文本选择
  };

  const handleMouseMove = (e: any) => {
    if (!allowSelect) return;
    if (isDragging) {
      setEndX((pre) => e.activeLabel || pre);
    } else {
      setActiveIndex(e.activeTooltipIndex || null);
    }
  };

  const handleMouseUp = (e: any) => {
    if (!allowSelect) return;
    setIsDragging(false);
    document.body.style.userSelect = ''; // 重新启用文本选择
    if (startX !== null && endX !== null) {
      const selectedTimeRange: [Dayjs, Dayjs] = [
        dayjs(Math.min(startX, endX) * 1000),
        dayjs(Math.max(startX, endX) * 1000),
      ];
      onXRangeChange && onXRangeChange(selectedTimeRange);
    }
    setStartX(null);
    setEndX(null);
  };

  const handleLegendClick = (key: string) => {
    setVisibleAreas((prevVisibleAreas) =>
      prevVisibleAreas.includes(key)
        ? prevVisibleAreas.filter((area) => area !== key)
        : [...prevVisibleAreas, key]
    );
  };

  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const tickWidth = 80; // 设置标签的最大宽度
    const words = String(payload.value).split('');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + word).length < tickWidth / 10) {
        currentLine += `${word}`;
      } else {
        lines.push(currentLine.trim());
        currentLine = `${word}`;
      }
    });
    lines.push(currentLine.trim());

    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={0}
            dy={index * 12}
            textAnchor="end"
            fill="var(--color-text-3)"
            fontSize={14}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  return (
    <div className="flex w-full h-full">
      {!!data.length ? (
        <>
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
                tick={renderYAxisTick}
                tickFormatter={(tick) => {
                  if (isStringArray(unit)) {
                    const unitName = JSON.parse(unit).find(
                      (item: ListItem) => item.id === tick
                    )?.name;
                    return unitName ? unitName : tick;
                  }
                  return tick;
                }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip
                offset={-40}
                content={
                  <CustomTooltip
                    unit={unit}
                    visible={!isDragging}
                    metric={metric as MetricItem}
                  />
                }
              />
              {getChartAreaKeys(data).map((key, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index]}
                  fillOpacity={0}
                  fill={colors[index]}
                  hide={!visibleAreas.includes(key)}
                />
              ))}
              {isDragging &&
                startX !== null &&
                endX !== null &&
                allowSelect && (
                <ReferenceArea
                  x1={Math.min(startX, endX)}
                  x2={Math.max(startX, endX)}
                  strokeOpacity={0.3}
                  fill="rgba(0, 0, 255, 0.1)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          {showDimensionFilter && hasDimension && (
            <DimensionFilter
              data={data}
              colors={colors}
              visibleAreas={visibleAreas}
              details={details}
              onLegendClick={handleLegendClick}
            />
          )}
        </>
      ) : (
        <div className={`${chartLineStyle.chart} ${chartLineStyle.noData}`}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </div>
  );
};

export default LineChart;
