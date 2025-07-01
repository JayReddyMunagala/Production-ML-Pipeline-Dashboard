import React from 'react';

interface MetricsChartProps {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export function MetricsChart({ accuracy, precision, recall, f1Score }: MetricsChartProps) {
  const metrics = [
    { label: 'Accuracy', value: accuracy, color: '#3B82F6' },
    { label: 'Precision', value: precision, color: '#10B981' },
    { label: 'Recall', value: recall, color: '#F59E0B' },
    { label: 'F1 Score', value: f1Score, color: '#EF4444' },
  ];

  const size = 160;
  const center = size / 2;
  const radius = 60;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-4">
        {metrics.map((metric, index) => {
          const angle = (index / metrics.length) * 2 * Math.PI - Math.PI / 2;
          const x1 = center;
          const y1 = center;
          const x2 = center + Math.cos(angle) * radius * metric.value;
          const y2 = center + Math.sin(angle) * radius * metric.value;
          
          return (
            <g key={metric.label}>
              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map(scale => (
                <circle
                  key={scale}
                  cx={center}
                  cy={center}
                  r={radius * scale}
                  fill="none"
                  stroke="#374151"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}
              
              {/* Metric line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={metric.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
              
              {/* Metric point */}
              <circle
                cx={x2}
                cy={y2}
                r="4"
                fill={metric.color}
              />
              
              {/* Axis line */}
              <line
                x1={center}
                y1={center}
                x2={center + Math.cos(angle) * radius}
                y2={center + Math.sin(angle) * radius}
                stroke="#6B7280"
                strokeWidth="1"
                opacity="0.5"
              />
            </g>
          );
        })}
      </svg>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {metrics.map(metric => (
          <div key={metric.label} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-slate-300">{metric.label}</span>
            <span className="text-slate-100 font-medium">
              {(metric.value * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}