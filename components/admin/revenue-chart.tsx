"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { name: "Jan", total: 12000 },
    { name: "Feb", total: 18000 },
    { name: "Mar", total: 15000 },
    { name: "Apr", total: 24000 },
    { name: "May", total: 28000 },
    { name: "Jun", total: 32000 },
    { name: "Jul", total: 45000 },
    { name: "Aug", total: 42000 },
    { name: "Sep", total: 55000 },
    { name: "Oct", total: 48500 },
    { name: "Nov", total: 62000 },
    { name: "Dec", total: 75000 },
]

export function RevenueChart() {
    return (
        <div className="glass-strong rounded-3xl p-6 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">Revenue Over Time</h3>
                <p className="text-sm text-muted-foreground">Monthly revenue performance</p>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white'
                            }}
                            itemStyle={{ color: 'white' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
