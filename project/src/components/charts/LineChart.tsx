import React from 'react';

interface DataPoint {
  x: string;
  y: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  title?: string;
}

export function LineChart({ data, height = 200, color = '#3B82F6', title }: LineChartProps) {
  if (!data.length) return null;

  const width = 400;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const rangeY = maxY - minY || 1;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.y - minY) / rangeY) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-slate-300 mb-2">{title}</h4>}
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Chart line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((point.y - minY) / rangeY) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="hover:r-4 transition-all duration-200"
            />
          );
        })}
        
        {/* Y-axis labels */}
        <text x="10" y={padding} className="text-xs fill-slate-400" dominantBaseline="middle">
          {maxY.toFixed(2)}
        </text>
        <text x="10" y={height - padding} className="text-xs fill-slate-400" dominantBaseline="middle">
          {minY.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}