/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Device, DeviceCategory, DictionaryFilters } from '../types';
import { CATEGORY_COLORS } from './CategoryDistribution';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Tag, 
  Cpu, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  X, 
  CheckCircle, 
  Radio, 
  Play, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeviceDictionaryProps {
  devices: Device[];
  selectedDevice: Device | null;
  onSelectDevice: (device: Device | null) => void;
  onFilterCategory?: string | null;
}

export default function DeviceDictionary({ 
  devices, 
  selectedDevice, 
  onSelectDevice,
  onFilterCategory 
}: DeviceDictionaryProps) {
  
  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(onFilterCategory || '');
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'mac' | 'rank'>('id');

  // Sync if category select comes from outside (e.g. clicking legend on dashboard)
  React.useEffect(() => {
    if (onFilterCategory !== undefined && onFilterCategory !== null) {
      setSelectedCategory(onFilterCategory);
    }
  }, [onFilterCategory]);

  // Extract unique filters from loaded database
  const uniqueSpaces = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.space).filter(Boolean))).sort();
  }, [devices]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.category).filter(Boolean))).sort();
  }, [devices]);

  const uniqueBusinessTypes = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.businessType).filter(Boolean))).sort();
  }, [devices]);

  // Filtering engine
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      // Fuzzy Search match
      const query = searchQuery.trim().toLowerCase();
      const nameMatch = d.productName.toLowerCase().includes(query);
      const modelMatch = d.productModel.toLowerCase().includes(query);
      const macMatch = d.mac.toLowerCase().includes(query);
      const idMatch = d.deviceId.toLowerCase().includes(query);
      const matchesSearch = query === '' || nameMatch || modelMatch || macMatch || idMatch;

      // Dropdown matches
      const matchesSpace = selectedSpace === '' || d.space === selectedSpace;
      const matchesCategory = selectedCategory === '' || d.category === selectedCategory;
      const matchesBizType = selectedBusinessType === '' || d.businessType === selectedBusinessType;

      // Quality Issues Check
      let matchesIssues = true;
      if (showOnlyIssues) {
        const isDuplicateMac = devices.filter(dev => dev.mac && dev.mac.trim().toUpperCase() === d.mac.trim().toUpperCase()).length > 1;
        const isMissingField = !d.mac || !d.productModel || !d.productName || !d.space;
        const isVirtual = d.mac.includes('00:00:00:00:00:00') || d.mac.includes('FF:FF:FF:FF:FF:FF') || d.businessType.includes('虚拟');
        const isUncategorized = d.category === '其他/待归类';
        matchesIssues = isDuplicateMac || isMissingField || isVirtual || isUncategorized;
      }

      return matchesSearch && matchesSpace && matchesCategory && matchesBizType && matchesIssues;
    }).sort((a, b) => {
      if (sortBy === 'id') return a.id - b.id;
      if (sortBy === 'name') return a.productName.localeCompare(b.productName);
      if (sortBy === 'mac') return (a.mac || '').localeCompare(b.mac || '');
      if (sortBy === 'rank') return Number(a.posRank1 || 0) - Number(b.posRank1 || 0);
      return 0;
    });
  }, [devices, searchQuery, selectedSpace, selectedCategory, selectedBusinessType, showOnlyIssues, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSpace('');
    setSelectedCategory('');
    setSelectedBusinessType('');
    setShowOnlyIssues(false);
  };

  const isFilterActive = searchQuery !== '' || selectedSpace !== '' || selectedCategory !== '' || selectedBusinessType !== '' || showOnlyIssues;

  // Local testing states for selected device simulator
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [blinkStatus, setBlinkStatus] = useState<'idle' | 'blinking' | 'done'>('idle');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  const runPingTest = (device: Device) => {
    if (!device.mac) {
      setPingStatus('failed');
      return;
    }
    setPingStatus('testing');
    setTimeout(() => {
      const isVirtual = device.mac.includes('00:00:00:00:00:00') || device.mac.includes('FF:FF:FF:FF:FF:FF');
      setPingStatus(isVirtual ? 'failed' : 'success');
    }, 1200);
  };

  const runBlinkTest = () => {
    setBlinkStatus('blinking');
    setTimeout(() => {
      setBlinkStatus('done');
    }, 2000);
  };

  const broadcastTelemetry = (device: Device) => {
    const timeStr = new Date().toLocaleTimeString();
    const mockData = device.category === '传感/环境' 
      ? `{"temperature": 23.8, "humidity": 48.2, "battery": 92}`
      : (device.category === '暖通/空调' ? `{"target_temp": 26, "mode": "cooling", "fan_speed": "auto"}` : `{"state": "ON", "rssi": -65, "voltage": 224.2}`);
    
    setTelemetryLogs(prev => [`[${timeStr}] BROADCAST: ${mockData}`, ...prev.slice(0, 5)]);
  };

  // Clear simulator on device selection change
  React.useEffect(() => {
    setPingStatus('idle');
    setBlinkStatus('idle');
    setTelemetryLogs([]);
  }, [selectedDevice]);

  return (
    <div className="space-y-6" id="dictionary-tab">
      
      {/* Filtering Cockpit Row */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 p-5 space-y-4">
        
        {/* Search Input and Sort control */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Search bar */}
          <div className="lg:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="智能检索：输入名称、型号、MAC 或设备编号..."
              className="w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-xs text-neutral-800 rounded-lg pl-10 pr-4 py-3 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="lg:col-span-3">
            <select
              id="filter-space"
              value={selectedSpace}
              onChange={(e) => setSelectedSpace(e.target.value)}
              className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-lg px-3 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
            >
              <option value="">所有空间 (全部)</option>
              {uniqueSpaces.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-lg px-3 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
            >
              <option value="">所有推断分类</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Extended Filters Rack */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-neutral-100">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Protocol Select */}
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-neutral-500 font-bold shrink-0">通讯方式：</span>
              <select
                id="filter-protocol"
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="bg-neutral-100 hover:bg-neutral-200/80 border-none text-neutral-700 font-semibold rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer transition"
              >
                <option value="">全部</option>
                {uniqueBusinessTypes.map(biz => (
                  <option key={biz} value={biz}>{biz}</option>
                ))}
              </select>
            </div>

            {/* Quality Issues filter */}
            <button
              id="filter-issues-toggle"
              onClick={() => setShowOnlyIssues(!showOnlyIssues)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center gap-1 transition ${
                showOnlyIssues 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold shadow-sm' 
                  : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> 仅显示异常设备
            </button>

            {/* Clear All Filters button */}
            {isFilterActive && (
              <button
                id="btn-clear-filters"
                onClick={clearAllFilters}
                className="text-neutral-500 hover:text-neutral-800 text-xs font-semibold flex items-center gap-0.5 border border-dashed rounded px-2.5 py-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 重置筛选
              </button>
            )}
          </div>

          {/* Sort selection */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-neutral-400 font-medium">排序：</span>
            <div className="flex bg-neutral-100 p-0.5 rounded">
              <button
                onClick={() => setSortBy('id')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${sortBy === 'id' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                默认
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${sortBy === 'name' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                产品名称
              </button>
              <button
                onClick={() => setSortBy('mac')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${sortBy === 'mac' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                MAC
              </button>
              <button
                onClick={() => setSortBy('rank')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${sortBy === 'rank' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Rank
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: dictionary list + selected device visual drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Device Dictionary Cards Grid (7/12 columns if device selected, otherwise 12/12) */}
        <div className={`${selectedDevice ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-neutral-500 font-medium">
              筛选出 <strong className="text-neutral-800 font-bold">{filteredDevices.length}</strong> 台智能家居设备
            </span>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-16 text-center text-neutral-500">
              <SlidersHorizontal className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
              <p className="text-sm font-semibold">没有符合筛选条件的设备</p>
              <button onClick={clearAllFilters} className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold mt-2 underline cursor-pointer">
                清除所有筛选条件
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedDevice ? 'sm:grid-cols-1 md:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'} gap-4`}>
              {filteredDevices.map((device) => {
                const isSelected = selectedDevice?.id === device.id;
                const catColor = CATEGORY_COLORS[device.category] || '#6b7280';
                
                // Inspect status errors for subtle card indicator
                const hasNoMac = !device.mac || device.mac.trim() === '';
                const isDuplicateMac = devices.filter(dev => dev.mac && dev.mac.trim().toUpperCase() === device.mac.trim().toUpperCase()).length > 1;
                const isVirtual = device.mac.includes('00:00:00:00:00:00') || device.mac.includes('FF:FF:FF:FF:FF:FF');
                const hasIssues = hasNoMac || isDuplicateMac || isVirtual || device.category === '其他/待归类';

                return (
                  <motion.div
                    key={device.id}
                    layoutId={`dict-card-${device.id}`}
                    whileHover={{ y: -2 }}
                    id={`dict-device-card-${device.id}`}
                    onClick={() => onSelectDevice(device)}
                    className={`bg-white rounded-xl border p-4.5 cursor-pointer flex flex-col justify-between space-y-3.5 transition relative overflow-hidden ${
                      isSelected 
                        ? 'ring-2 ring-indigo-500 border-transparent shadow-md' 
                        : 'border-neutral-200/80 hover:border-neutral-300 shadow-sm'
                    }`}
                  >
                    {/* Top Section */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] text-neutral-400 font-mono">#{device.id}</span>
                        <span 
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold border"
                          style={{ 
                            color: catColor, 
                            borderColor: `${catColor}30`, 
                            backgroundColor: `${catColor}10` 
                          }}
                        >
                          {device.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-neutral-800 line-clamp-1 group-hover:text-indigo-600 transition" title={device.productName}>
                          {device.productName}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5" title={device.productModel}>
                          {device.productModel || <span className="text-amber-500">未标记型号</span>}
                        </p>
                      </div>
                    </div>

                    {/* Metadata specs */}
                    <div className="space-y-1 text-[10px] text-neutral-500 pt-2 border-t border-neutral-100">
                      <div className="flex items-center space-x-1 font-semibold text-neutral-600">
                        <MapPin className="w-3 h-3 shrink-0 text-neutral-400" />
                        <span className="truncate">{device.space} / {device.roomCode}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">协议:</span>
                        <span className="font-mono text-neutral-700 font-semibold">{device.businessType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">MAC:</span>
                        <span className={`font-mono font-semibold ${hasNoMac ? 'text-rose-500 font-bold' : (isDuplicateMac ? 'text-amber-600' : 'text-neutral-700')}`}>
                          {device.mac ? (isVirtual ? '虚拟设备' : device.mac) : '无'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom capability tags and warning flags */}
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                      <div className="flex flex-wrap gap-1">
                        {device.capabilities && device.capabilities.slice(0, 2).map((cap) => (
                          <span key={cap} className="bg-neutral-50 text-neutral-500 px-1.5 py-0.5 rounded text-[8px] font-bold">
                            {cap}
                          </span>
                        ))}
                      </div>

                      {hasIssues && (
                        <span className="text-rose-500 shrink-0" title="该设备台账有数据质量缺陷，请查看审计页面">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clickable device details panel (5/12 columns visual layout) */}
        <AnimatePresence>
          {selectedDevice && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-5 bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 p-6 space-y-6 sticky top-4 overflow-hidden"
              id="device-details-panel"
            >
              {/* Header Close and title */}
              <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <span className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase font-mono">
                    Device Digital Spec Sheet
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-100 mt-1">{selectedDevice.productName}</h3>
                  <p className="text-xs text-neutral-400 font-mono">{selectedDevice.productModel || '型号缺失'}</p>
                </div>
                <button
                  id="btn-close-details"
                  onClick={() => onSelectDevice(null)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white p-1.5 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Specs detailed table */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">物理及业务层级信息</h4>
                <div className="bg-neutral-950/80 rounded-xl p-4 border border-neutral-800 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">序号 (Index)</span>
                    <span className="text-neutral-200">{selectedDevice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">设备编号</span>
                    <span className="text-neutral-200">{selectedDevice.deviceId || '空'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">MAC 地址</span>
                    <span className={`text-neutral-200 ${!selectedDevice.mac ? 'text-rose-400 font-bold' : ''}`}>
                      {selectedDevice.mac || '无 (空)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">业务通讯类型</span>
                    <span className="text-neutral-200 font-bold text-indigo-400">{selectedDevice.businessType || '空'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">物业项目名称</span>
                    <span className="text-neutral-200 truncate max-w-[180px]" title={selectedDevice.propertyAddress}>
                      {selectedDevice.propertyAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">房源编号 / 空间</span>
                    <span className="text-neutral-200">{selectedDevice.roomCode} ({selectedDevice.space})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">posRank1</span>
                    <span className="text-neutral-200">{selectedDevice.posRank1}</span>
                  </div>
                </div>
              </div>

              {/* Inferred capabilities tags explained */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">自动推断功能说明</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDevice.capabilities && selectedDevice.capabilities.map((cap) => (
                    <span key={cap} className="bg-indigo-950 text-indigo-300 border border-indigo-900/40 px-2.5 py-1 rounded-xs text-[10px] font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-400" />
                      {cap}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed italic bg-neutral-950/40 p-3 rounded-lg border border-neutral-850">
                  词典解析：基于该产品的名称、业务网关特征和协议模型，字典判断其原生具备{' '}
                  {selectedDevice.capabilities?.join('、')} 以及远程即时遥控与空间场景联动等物理特性。
                </p>
              </div>

              {/* Playful Simulator Testing Section */}
              <div className="space-y-4 pt-3 border-t border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-extrabold text-neutral-200">智能设备调测控制台 (Sim)</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Ping check */}
                  <button
                    id="btn-test-ping"
                    onClick={() => runPingTest(selectedDevice)}
                    className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    {pingStatus === 'testing' ? '正在连接...' : 'Ping 通讯测试'}
                  </button>

                  {/* Blink led */}
                  <button
                    id="btn-test-blink"
                    onClick={runBlinkTest}
                    className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    {blinkStatus === 'blinking' ? '面板指示灯闪烁...' : '唤醒面板指示灯'}
                  </button>
                </div>

                {/* Status indicator feedbacks */}
                <div className="space-y-2 text-xs">
                  {pingStatus === 'success' && (
                    <div className="bg-emerald-950/80 border border-emerald-900/60 text-emerald-300 p-2.5 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>连接成功：设备在线且延迟正常 (&lt;15ms)</span>
                    </div>
                  )}
                  {pingStatus === 'failed' && (
                    <div className="bg-rose-950/80 border border-rose-900/60 text-rose-300 p-2.5 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>连接失败：MAC无效或虚拟通道未广播。</span>
                    </div>
                  )}
                  {blinkStatus === 'done' && (
                    <div className="bg-neutral-800 text-amber-300 p-2.5 rounded-lg flex items-center gap-2 border border-amber-900/30">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>下发成功：该面板蓝色状态 LED 已连续闪烁 3 次。</span>
                    </div>
                  )}

                  {/* Telemetry broadcast broadcast trigger */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">实时遥测遥信广播</span>
                      <button 
                        id="btn-broadcast-telemetry"
                        onClick={() => broadcastTelemetry(selectedDevice)}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        广播一次数据
                      </button>
                    </div>

                    <div className="bg-black/80 rounded-lg p-2.5 h-24 overflow-y-auto font-mono text-[10px] text-emerald-400 border border-neutral-850 space-y-1">
                      {telemetryLogs.length === 0 ? (
                        <p className="text-neutral-500 italic">点击“广播一次数据”接收传感器或开关心跳报文...</p>
                      ) : (
                        telemetryLogs.map((log, idx) => (
                          <p key={idx} className="leading-relaxed">{log}</p>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
