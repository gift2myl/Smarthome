/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Device, DataQualityReport } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  ShieldAlert, 
  CircleDot, 
  Layers, 
  MapPin, 
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';

interface DataQualityProps {
  devices: Device[];
  qualityReport: DataQualityReport;
  onSelectDevice?: (device: Device) => void;
}

export default function DataQuality({ devices, qualityReport, onSelectDevice }: DataQualityProps) {
  const [activeTab, setActiveTab] = useState<'duplicates' | 'missing' | 'virtual' | 'uncategorized'>('duplicates');

  // 1. Group duplicate MAC devices
  const duplicateMacDevices = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach(d => {
      const mac = d.mac.trim().toUpperCase();
      if (mac) counts[mac] = (counts[mac] || 0) + 1;
    });

    return devices.filter(d => {
      const mac = d.mac.trim().toUpperCase();
      return mac && counts[mac] > 1;
    }).reduce((acc, curr) => {
      const mac = curr.mac.trim().toUpperCase();
      if (!acc[mac]) acc[mac] = [];
      acc[mac].push(curr);
      return acc;
    }, {} as Record<string, Device[]>);
  }, [devices]);

  // 2. Identify missing fields
  const missingFieldDevices = useMemo(() => {
    const list: { device: Device; missingFields: string[] }[] = [];
    devices.forEach(d => {
      const missing: string[] = [];
      if (!d.mac || d.mac.trim() === '') missing.push('设备mac');
      if (!d.productModel || d.productModel.trim() === '') missing.push('产品型号');
      if (!d.productName || d.productName.trim() === '') missing.push('产品名称');
      if (!d.space || d.space.trim() === '') missing.push('空间');
      
      if (missing.length > 0) {
        list.push({ device: d, missingFields: missing });
      }
    });
    return list;
  }, [devices]);

  // 3. Virtual devices filter
  const virtualDevices = useMemo(() => {
    const virtualMacs = ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', 'VIRTUAL', 'MOCK', '00:00:00:00', 'FF:FF:FF:FF'];
    return devices.filter(d => {
      const mac = d.mac.trim().toUpperCase();
      return virtualMacs.some(v => mac.includes(v)) || d.businessType.includes('虚拟');
    });
  }, [devices]);

  // 4. Uncategorized devices filter
  const uncategorizedDevices = useMemo(() => {
    return devices.filter(d => d.category === '其他/待归类');
  }, [devices]);

  // Export cleaned list
  const exportCleanedData = () => {
    // Generate clean output structure incorporating inferred category and capability tags
    const outputData = devices.map(d => ({
      '序号': d.id,
      '物业地址': d.propertyAddress,
      '房源编号': d.roomCode,
      '空间': d.space,
      '产品名称': d.productName,
      '产品型号': d.productModel,
      '设备编号': d.deviceId,
      '业务类型': d.businessType,
      '设备mac': d.mac,
      'posRank1': d.posRank1,
      '智能自动推断分类': d.category,
      '推断能力特征标签': d.capabilities ? d.capabilities.join('; ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(outputData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '清洗 enrichment 设备大表');
    
    // Set widths
    worksheet['!cols'] = [
      { wch: 6 },  // ID
      { wch: 25 }, // Address
      { wch: 15 }, // Code
      { wch: 10 }, // Space
      { wch: 20 }, // Name
      { wch: 16 }, // Model
      { wch: 15 }, // DeviceID
      { wch: 12 }, // Type
      { wch: 18 }, // MAC
      { wch: 10 }, // Rank
      { wch: 18 }, // Inferred Category
      { wch: 40 }  // Capabilities
    ];

    XLSX.writeFile(workbook, '已智能清洗与自动推断的设备数据库.xlsx');
  };

  // Radial Dial Score calculations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = qualityReport.qualityScore;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Emerald
    if (score >= 75) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="space-y-8" id="data-quality-tab">
      
      {/* Visual Header with Quality Circle gauge */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-neutral-800">数据库自动化质检审计系统</h2>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            该子系统针对项目导入的设备明细大表，自动进行数据清洗和质量诊断。重点核实物理 MAC 冲突、关键字段空缺、测试型虚拟对象、及在推断分类中失效的商品命名，避免施工调试环节中设备失联或控制失效。
          </p>
          <div className="pt-2">
            <button
              id="btn-export-cleaned"
              onClick={exportCleanedData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> 导出已智能清洗并标注的 Excel 表格
            </button>
          </div>
        </div>

        {/* Circular Dial Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full rotate-[-90deg]">
              {/* background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
              />
              {/* score arc progress */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="transparent"
                stroke={getScoreColor(scorePercent)}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold" style={{ color: getScoreColor(scorePercent) }}>
                {scorePercent}
              </span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">质量健康分</span>
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-700 mt-2">
            {scorePercent >= 90 ? '数据评级：优秀 (可以直接用于部署)' : (scorePercent >= 75 ? '数据评级：中等 (建议进行局部更正)' : '数据评级：极差 (必须立即修正数据)')}
          </p>
        </div>

      </div>

      {/* Issues Tabs and Breakdowns */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 overflow-hidden">
        
        {/* Tabs Bar Bar Header */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 overflow-x-auto scrollbar-none">
          <button
            id="tab-btn-duplicates"
            onClick={() => setActiveTab('duplicates')}
            className={`px-5 py-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'duplicates'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            重复 MAC 异常 ({qualityReport.duplicateMacCount} 组)
          </button>
          
          <button
            id="tab-btn-missing"
            onClick={() => setActiveTab('missing')}
            className={`px-5 py-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'missing'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            空必填字段 ({qualityReport.missingFieldsCount} 处)
          </button>

          <button
            id="tab-btn-virtual"
            onClick={() => setActiveTab('virtual')}
            className={`px-5 py-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'virtual'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            虚拟中间件 ({qualityReport.virtualDeviceCount} 台)
          </button>

          <button
            id="tab-btn-uncategorized"
            onClick={() => setActiveTab('uncategorized')}
            className={`px-5 py-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'uncategorized'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            分类推断待决 ({qualityReport.uncategorizedCount} 台)
          </button>
        </div>

        {/* Tab content stage */}
        <div className="p-6">
          
          {/* 1. DUPLICATE MACS PANEL */}
          {activeTab === 'duplicates' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-600 border border-neutral-150 space-y-1">
                <span className="font-bold text-neutral-800 block">⚠️ 物理 MAC 冲突规则：</span>
                <p>MAC 地址是智能家居网络中设备的唯一物理标识符。若两台或多台设备具备相同的 MAC，说明可能存在 Excel 录入时的复制粘贴失误，必须及时更正，否则会导致通信总线冲突或状态完全失效。</p>
              </div>

              {Object.keys(duplicateMacDevices).length === 0 ? (
                <div className="p-12 text-center text-emerald-600 font-bold flex flex-col items-center space-y-2 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <span>全盘数据未检测到任何物理 MAC 冲突！数据很干净。</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(duplicateMacDevices).map((mac) => {
                    const group = duplicateMacDevices[mac];
                    return (
                      <div key={mac} className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-rose-50 border-b border-rose-100 p-3.5 flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-rose-800">冲突 MAC：{mac}</span>
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            关联设备数量：{group.length} 台
                          </span>
                        </div>
                        <div className="divide-y divide-neutral-150">
                          {group.map((device) => (
                            <div 
                              key={device.id} 
                              className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-neutral-50/50 transition"
                            >
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-[10px] text-neutral-400">#{device.id}</span>
                                  <h4 className="font-bold text-neutral-800 hover:text-indigo-600 cursor-pointer" onClick={() => onSelectDevice && onSelectDevice(device)}>
                                    {device.productName}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
                                  <span>型号: {device.productModel || '无'}</span>
                                  <span>房源/空间: {device.roomCode} ({device.space})</span>
                                </div>
                              </div>

                              <div className="text-[11px] text-neutral-500 text-right space-y-1 shrink-0 font-medium">
                                <p className="flex items-center gap-1 justify-end"><MapPin className="w-3 h-3 text-neutral-400" /> {device.propertyAddress}</p>
                                <p>协议: {device.businessType}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. MISSING FIELDS PANEL */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-600 border border-neutral-150 space-y-1">
                <span className="font-bold text-neutral-800 block">⚠️ 关键物理项空缺规范：</span>
                <p>设备台账中的 MAC 地址、产品型号、安装空间等是全生命周期数据链的根基。若存在缺失，容易导致自动分类推断模块直接失灵或导致现场排查时无法寻址。</p>
              </div>

              {missingFieldDevices.length === 0 ? (
                <div className="p-12 text-center text-emerald-600 font-bold flex flex-col items-center space-y-2 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <span>所有导入的数据完备，没有检测到空字段！</span>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
                        <th className="py-3 px-4">序号</th>
                        <th className="py-3 px-4">产品名称</th>
                        <th className="py-3 px-4">缺失字段</th>
                        <th className="py-3 px-4">安装位置</th>
                        <th className="py-3 px-4">修复整改建议</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150 text-neutral-700">
                      {missingFieldDevices.map(({ device, missingFields }, index) => (
                        <tr key={index} className="hover:bg-neutral-50/50 transition">
                          <td className="py-3.5 px-4 font-mono text-neutral-400">#{device.id}</td>
                          <td className="py-3.5 px-4">
                            <h4 className="font-bold text-neutral-800 hover:text-indigo-600 cursor-pointer" onClick={() => onSelectDevice && onSelectDevice(device)}>
                              {device.productName || <span className="text-rose-500">产品名为空</span>}
                            </h4>
                            <span className="text-[10px] text-neutral-400 block font-mono">{device.productModel || '未标记型号'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {missingFields.map(f => (
                                <span key={f} className="bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 font-mono">
                            {device.roomCode} ({device.space || <span className="text-rose-400 font-bold">未填</span>})
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 italic">
                            请在 Excel 中为这一行补齐 <span className="text-indigo-600 font-semibold">{missingFields.join('和')}</span>，随后重新上传。
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. VIRTUAL DEVICES PANEL */}
          {activeTab === 'virtual' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-600 border border-neutral-150 space-y-1">
                <span className="font-bold text-neutral-800 block">ℹ️ 虚拟中间件过滤规则：</span>
                <p>虚拟设备或代理服务通常是软件中台、虚拟通道、或者是开发阶段的测试桩（MAC 一般设为 00:00:00:00:00:00 或者是 FF:FF:FF:FF:FF:FF 等）。数字字典会自动将其分类，在真正施工时应剔除这一批物理安装设备。</p>
              </div>

              {virtualDevices.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 text-xs font-semibold">
                  <span>全表未含有任何虚拟测试设备或软件代理网关。</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {virtualDevices.map((device) => (
                    <div 
                      key={device.id} 
                      className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/20 flex flex-col justify-between hover:border-indigo-300 transition"
                    >
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-neutral-400">#{device.id}</span>
                          <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px]">
                            虚拟总线节点
                          </span>
                        </div>
                        <h4 className="font-bold text-neutral-800 hover:text-indigo-600 cursor-pointer" onClick={() => onSelectDevice && onSelectDevice(device)}>
                          {device.productName}
                        </h4>
                        <p className="text-neutral-500 font-mono text-[11px]">型号：{device.productModel}</p>
                        <p className="text-neutral-500 font-mono text-[11px]">占位MAC：<span className="text-indigo-600">{device.mac}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. UNCATEGORIZED PANEL */}
          {activeTab === 'uncategorized' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-600 border border-neutral-150 space-y-1">
                <span className="font-bold text-neutral-800 block">ℹ️ 其它与待归类原因：</span>
                <p>基于 NLP 内置字典，系统会检索产品名称与型号特征。若某设备名称过短、仅含英文特殊编码或名称为“特制调试箱”等，系统将将其丢至待决分类。建议在 Excel 中修正该名称，以便智能自动分类顺利触发。</p>
              </div>

              {uncategorizedDevices.length === 0 ? (
                <div className="p-12 text-center text-emerald-600 font-bold flex flex-col items-center space-y-2 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <span>太棒了！所有导入设备的名称与型号完全被算法解析，无一例外。</span>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
                        <th className="py-3 px-4">序号</th>
                        <th className="py-3 px-4">导入的产品名称</th>
                        <th className="py-3 px-4">产品型号</th>
                        <th className="py-3 px-4">通讯协议</th>
                        <th className="py-3 px-4">整改修复建议</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150 text-neutral-700">
                      {uncategorizedDevices.map((device) => (
                        <tr key={device.id} className="hover:bg-neutral-50/50 transition">
                          <td className="py-3.5 px-4 font-mono text-neutral-400">#{device.id}</td>
                          <td className="py-3.5 px-4 font-bold text-neutral-800">
                            <span onClick={() => onSelectDevice && onSelectDevice(device)} className="hover:text-indigo-600 cursor-pointer">
                              {device.productName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-500">{device.productModel || '未录入'}</td>
                          <td className="py-3.5 px-4 font-mono text-neutral-500">{device.businessType}</td>
                          <td className="py-3.5 px-4 text-neutral-500 italic">
                            请尝试包含如“射灯”、“调光器”、“温控器”等标准中文字词，或将型号设为 “SW” 或 “SD”，系统字典将自动关联其九大子系统。
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
