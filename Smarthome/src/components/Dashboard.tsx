/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Database, 
  Home, 
  Layers, 
  Cpu, 
  AlertTriangle, 
  Upload, 
  Download, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';
import { Device, DataQualityReport } from '../types';
import { enrichDevices, analyzeDataQuality, DEFAULT_DEVICES } from '../data/deviceData';
import { motion } from 'motion/react';

interface DashboardProps {
  devices: Device[];
  qualityReport: DataQualityReport;
  onDevicesChange: (newDevices: Device[]) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  devices, 
  qualityReport, 
  onDevicesChange, 
  onNavigate 
}: DashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Derive unique stats
  const uniqueSpaces = new Set(devices.map(d => `${d.propertyAddress}-${d.space}`)).size;
  const uniqueModels = new Set(devices.map(d => d.productModel).filter(Boolean)).size;
  const uniqueCategories = new Set(devices.map(d => d.category)).size;
  const uniqueProperties = new Set(devices.map(d => d.propertyAddress)).size;

  // Handle excel processing
  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('读取文件失败');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON
        const rawJson = XLSX.utils.sheet_to_json<any>(worksheet);
        
        if (rawJson.length === 0) {
          throw new Error('Excel文件内容为空');
        }

        // Validate columns (check if any key column matches Chinese names)
        const sampleRow = rawJson[0];
        const hasRequiredCols = ['产品名称', '空间', '产品型号', '设备mac'].some(col => 
          Object.keys(sampleRow).some(key => key.includes(col))
        );

        if (!hasRequiredCols && !Object.keys(sampleRow).some(k => ['productName', 'space'].includes(k))) {
          throw new Error('未检测到符合规范的智能家居列名，请下载并使用模板！');
        }

        // Parse and enrich
        const parsedDevices = enrichDevices(rawJson);
        onDevicesChange(parsedDevices);
        setImportSuccess(`成功导入 ${parsedDevices.length} 个智能设备数据！已自动推断分类与能力标签。`);
        setImportError(null);
        
        setTimeout(() => setImportSuccess(null), 5000);
      } catch (err: any) {
        setImportError(err.message || '解析 Excel 失败，请检查文件格式。');
        setImportSuccess(null);
      }
    };
    reader.onerror = () => {
      setImportError('文件读取错误');
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcel(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcel(e.dataTransfer.files[0]);
    }
  };

  // Dynamic template exporter
  const downloadTemplate = () => {
    // Generate clean template data
    const templateData = DEFAULT_DEVICES.map(d => ({
      '序号': d.id,
      '物业地址': d.propertyAddress,
      '房源编号': d.roomCode,
      '空间': d.space,
      '产品名称': d.productName,
      '产品型号': d.productModel,
      '设备编号': d.deviceId,
      '业务类型': d.businessType,
      '设备mac': d.mac,
      'posRank1': d.posRank1
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '设备台账数据库');
    
    // Set widths for better readability
    const max_len = templateData.reduce((prev, next) => {
      Object.keys(next).forEach((key, idx) => {
        const valStr = String((next as any)[key] || '');
        const cellLen = valStr.match(/[\u4e00-\u9fa5]/g) ? valStr.length * 2 : valStr.length;
        prev[idx] = Math.max(prev[idx] || 10, cellLen + 4);
      });
      return prev;
    }, [] as number[]);
    worksheet['!cols'] = max_len.map(w => ({ wch: w }));

    XLSX.writeFile(workbook, '智能家居设备数据库_导入模板.xlsx');
  };

  const restoreDefaultData = () => {
    onDevicesChange(enrichDevices(DEFAULT_DEVICES));
    setImportSuccess('已恢复至出厂默认演示设备库（70+台设备）');
    setImportError(null);
    setTimeout(() => setImportSuccess(null), 3000);
  };

  return (
    <div className="space-y-8" id="dashboard-tab">
      {/* Overview Intro */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Database className="w-64 h-64 -mr-16 -mb-16" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="bg-indigo-600/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-indigo-500/30 uppercase">
            Smart Home IoT Dictionary
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            智能家居设备数字字典系统
          </h1>
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
            本系统针对智能家居项目交付的设备 Excel 数据表，自动清洗、提取、推断分类与能力标签，提供完整的空间层级关系、词典详情检索及整盘数据质量审计。
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="btn-goto-dict"
              onClick={() => onNavigate('dictionary')}
              className="bg-white text-neutral-900 hover:bg-neutral-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all duration-200 cursor-pointer"
            >
              词典检索 <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-restore-data"
              onClick={restoreDefaultData}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-700 transition-all cursor-pointer"
            >
              恢复演示数据
            </button>
          </div>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Devices */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200/80 flex items-center space-x-4"
          id="kpi-total-devices"
        >
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">设备总数</p>
            <h3 className="text-2xl font-bold text-neutral-900">{devices.length} <span className="text-xs font-normal text-neutral-500">台</span></h3>
          </div>
        </motion.div>

        {/* Unique Spaces */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200/80 flex items-center space-x-4"
          id="kpi-total-spaces"
        >
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">涉及空间</p>
            <h3 className="text-2xl font-bold text-neutral-900">{uniqueSpaces} <span className="text-xs font-normal text-neutral-500">个</span></h3>
          </div>
        </motion.div>

        {/* Unique Models */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200/80 flex items-center space-x-4"
          id="kpi-total-models"
        >
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">产品型号</p>
            <h3 className="text-2xl font-bold text-neutral-900">{uniqueModels} <span className="text-xs font-normal text-neutral-500">款</span></h3>
          </div>
        </motion.div>

        {/* Project Count */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200/80 flex items-center space-x-4"
          id="kpi-total-properties"
        >
          <div className="p-3 rounded-lg bg-cyan-50 text-cyan-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">物业项目</p>
            <h3 className="text-2xl font-bold text-neutral-900">{uniqueProperties} <span className="text-xs font-normal text-neutral-500">个</span></h3>
          </div>
        </motion.div>

        {/* Quality Alerts */}
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('quality')}
          className={`p-5 rounded-xl shadow-sm border flex items-center space-x-4 cursor-pointer transition-colors ${
            qualityReport.qualityScore < 85 
              ? 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100/70' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
          }`}
          id="kpi-quality-score"
        >
          <div className={`p-3 rounded-lg ${qualityReport.qualityScore < 85 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium opacity-80">数据健康度</p>
            <h3 className="text-2xl font-bold">{qualityReport.qualityScore} <span className="text-xs font-normal opacity-80">分</span></h3>
          </div>
        </motion.div>
      </div>

      {/* Main Column: Excel File Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dropzone & Import Info */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200/80 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-neutral-800">导入自有 Excel 数据表</h2>
            </div>
            <button
              id="btn-download-template"
              onClick={downloadTemplate}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 transition"
            >
              <Download className="w-3.5 h-3.5" /> 下载 Excel 模版
            </button>
          </div>

          {/* Feedback messages */}
          {importSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>{importSuccess}</p>
            </div>
          )}

          {importError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{importError}</p>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            id="excel-dropzone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive 
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                : 'border-neutral-300 hover:border-indigo-400 bg-neutral-50/50 hover:bg-neutral-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 rounded-full bg-white shadow-sm border border-neutral-200">
                <Upload className="w-8 h-8 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-700">
                  点击上传 或拖拽 Excel/CSV 文件至此处
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  支持 .xlsx, .xls, .csv 格式 (推荐文件小于 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Tips Panel */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150 text-xs text-neutral-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-neutral-700 mb-1">
              <Info className="w-4 h-4 text-amber-600" />
              <span>表格格式及识别规范说明：</span>
            </div>
            <p>1. 系统完美兼容包含以下表头的 Excel 表格（简繁体均可，表头可以位于首行）：</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 py-1 text-[11px] font-mono text-indigo-700">
              <span className="bg-white border px-1.5 py-0.5 rounded">序号</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">物业地址</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">房源编号</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">空间</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">产品名称</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">产品型号</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">设备编号</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">业务类型</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">设备mac</span>
              <span className="bg-white border px-1.5 py-0.5 rounded">posRank1</span>
            </div>
            <p>2. <strong className="text-neutral-800">智能分类推断</strong>：基于产品名称与型号内置了自然语言分词字典，智能识别出九大设备类型。</p>
            <p>3. <strong className="text-neutral-800">自动能力推断</strong>：多维度推导并标记如温湿度精确侦测、毫米波雷达、高阶多协议适配等多能型标签，免去逐一录入烦恼。</p>
          </div>
        </div>

        {/* Data Quality Warning Quick Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              数据质量快报
            </h2>
            <div className="space-y-3.5 py-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  重复 MAC 冲突
                </span>
                <span className={`font-semibold ${qualityReport.duplicateMacCount > 0 ? 'text-rose-600' : 'text-neutral-700'}`}>
                  {qualityReport.duplicateMacCount} 组
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  必填项缺失
                </span>
                <span className={`font-semibold ${qualityReport.missingFieldsCount > 0 ? 'text-amber-600' : 'text-neutral-700'}`}>
                  {qualityReport.missingFieldsCount} 处
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  虚拟中间设备
                </span>
                <span className="font-semibold text-neutral-700">
                  {qualityReport.virtualDeviceCount} 台
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  其他待归类产品
                </span>
                <span className={`font-semibold ${qualityReport.uncategorizedCount > 0 ? 'text-amber-500' : 'text-neutral-700'}`}>
                  {qualityReport.uncategorizedCount} 台
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-100">
            <button
              id="btn-goto-quality"
              onClick={() => onNavigate('quality')}
              className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200/80 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              查看数据清洗与审计详情 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
