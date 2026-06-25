/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Device, DeviceCategory } from '../types';
import { Layers, PieChart as PieIcon, BarChart2, Info } from 'lucide-react';

interface CategoryDistributionProps {
  devices: Device[];
  onSelectCategory?: (category: string) => void;
}

// Fixed beautiful color theme for the 9 categories
export const CATEGORY_COLORS: Record<DeviceCategory, string> = {
  '灯光/回路': '#6366f1', // Indigo
  '开关面板': '#3b82f6', // Blue
  '插座/计量': '#10b981', // Emerald
  '窗帘/卷帘/门窗': '#06b6d4', // Cyan
  '中控/网关': '#f59e0b', // Amber
  '暖通/空调': '#ef4444', // Red
  '传感/环境': '#8b5cf6', // Purple
  '安防/门锁': '#ec4899', // Pink
  '其他/待归类': '#6b7280' // Gray
};

export default function CategoryDistribution({ devices, onSelectCategory }: CategoryDistributionProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Compute category counts
  const categoryCounts = devices.reduce((acc, device) => {
    const cat = device.category || '其他/待归类';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ensure all 9 categories have a record (even if 0)
  const categoriesList: DeviceCategory[] = [
    '灯光/回路',
    '开关面板',
    '插座/计量',
    '窗帘/卷帘/门窗',
    '中控/网关',
    '暖通/空调',
    '传感/环境',
    '安防/门锁',
    '其他/待归类'
  ];

  const data = categoriesList.map(cat => {
    const count = categoryCounts[cat] || 0;
    const percentage = devices.length > 0 ? ((count / devices.length) * 100).toFixed(1) : '0';
    
    // Find representative products in this category
    const matches = devices.filter(d => d.category === cat);
    const uniqueProductNames = Array.from(new Set(matches.map(d => d.productName))).slice(0, 3);
    const representative = uniqueProductNames.length > 0 ? uniqueProductNames.join('、') : '暂无数据';

    return {
      name: cat,
      value: count,
      percentage: Number(percentage),
      representative,
      color: CATEGORY_COLORS[cat]
    };
  }).sort((a, b) => b.value - a.value); // Sort descending

  // Recharts customized tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataInfo = payload[0].payload;
      return (
        <div className="bg-neutral-900 text-white p-3.5 rounded-lg shadow-xl border border-neutral-800 text-xs space-y-1">
          <p className="font-bold text-neutral-200">{dataInfo.name}</p>
          <p className="text-neutral-400">数量：<span className="font-semibold text-white text-sm">{dataInfo.value}</span> 台</p>
          <p className="text-neutral-400">占比：<span className="font-semibold text-indigo-400">{dataInfo.percentage}%</span></p>
          <p className="text-neutral-500 text-[10px] max-w-xs pt-1 border-t border-neutral-800">
            代表产品：{dataInfo.representative}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 p-6 space-y-8" id="category-distribution-tab">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-neutral-800">设备类别分布分析</h2>
            <p className="text-xs text-neutral-500">智能算法自动推断得出的系统类型配比分布</p>
          </div>
        </div>

        {/* Toggle Chart Type */}
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
              chartType === 'pie' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" /> 占比饼图
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
              chartType === 'bar' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> 排名柱图
          </button>
        </div>
      </div>

      {/* Charts Visualization Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        
        {/* Chart View (3/5 columns) */}
        <div className="lg:col-span-3 h-[320px] md:h-[360px] flex items-center justify-center relative bg-neutral-50/50 rounded-xl p-4 border border-neutral-100">
          {devices.length === 0 ? (
            <div className="text-neutral-400 text-sm flex flex-col items-center space-y-2">
              <Info className="w-8 h-8" />
              <span>暂无数据，请在首页导入设备数据库</span>
            </div>
          ) : chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#4b5563', fontSize: 11 }} 
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Center Info in Pie Chart */}
          {chartType === 'pie' && devices.length > 0 && (
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-neutral-400 font-medium">智能设备</span>
              <span className="text-3xl font-extrabold text-neutral-800">{devices.length}</span>
              <span className="text-xs text-neutral-400">系统总数</span>
            </div>
          )}
        </div>

        {/* Categories Colored Legend Grid (2/5 columns) */}
        <div className="lg:col-span-2 space-y-3.5">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">系统构成指标</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {data.map((item) => (
              <div 
                key={item.name}
                onClick={() => onSelectCategory && item.value > 0 && onSelectCategory(item.name)}
                className={`p-2.5 rounded-lg border border-neutral-100 flex items-center justify-between group transition cursor-pointer hover:bg-neutral-50 hover:border-neutral-200 ${
                  item.value === 0 ? 'opacity-40 select-none pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 group-hover:scale-110 transition"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-neutral-700 truncate">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-neutral-500 font-medium">{item.value} 台</span>
                  <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Table of Detailed Counts */}
      <div className="border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600">
              <th className="py-3 px-4">系统类别</th>
              <th className="py-3 px-4">设备数量</th>
              <th className="py-3 px-4">全盘占比</th>
              <th className="py-3 px-4">主要代表产品</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-150 text-xs text-neutral-700">
            {data.map((item) => (
              <tr 
                key={item.name} 
                className={`hover:bg-neutral-50/50 transition ${item.value === 0 ? 'bg-neutral-50/30 text-neutral-400' : ''}`}
              >
                <td className="py-3 px-4 font-bold flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </td>
                <td className="py-3 px-4 font-semibold">{item.value} 台</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-10 text-right">{item.percentage}%</span>
                    <div className="w-16 bg-neutral-100 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                      <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-neutral-500 italic max-w-xs truncate" title={item.representative}>
                  {item.representative}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
