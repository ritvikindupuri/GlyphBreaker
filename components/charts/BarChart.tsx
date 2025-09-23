import React from 'react';

interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const chartHeight = 200;
    const barWidth = 30;
    const barMargin = 15;
    const chartWidth = data.length * (barWidth + barMargin);

    return (
        <div className="p-4 bg-sentinel-bg rounded-lg border border-sentinel-border/50 my-2">
            <h3 className="text-center font-semibold text-sentinel-text-primary mb-4">{title}</h3>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-auto">
                <g transform="translate(0, 10)">
                    {data.map((d, i) => {
                        const barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={d.label}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="url(#barGradient)"
                                    className="transition-all duration-500"
                                >
                                    <animate
                                        attributeName="height"
                                        from="0"
                                        to={barHeight}
                                        dur="0.5s"
                                        fill="freeze"
                                    />
                                     <animate
                                        attributeName="y"
                                        from={chartHeight}
                                        to={y}
                                        dur="0.5s"
                                        fill="freeze"
                                    />
                                </rect>
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 5}
                                    textAnchor="middle"
                                    className="text-xs font-medium fill-current text-sentinel-text-primary"
                                >
                                    {d.value}
                                </text>
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 15}
                                    textAnchor="middle"
                                    className="text-xs fill-current text-sentinel-text-secondary"
                                >
                                    {d.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00A9FF" />
                        <stop offset="100%" stopColor="#007ACC" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};