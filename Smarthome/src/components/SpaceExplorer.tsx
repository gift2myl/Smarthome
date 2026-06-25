/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Device, DeviceCategory } from '../types';
import { CATEGORY_COLORS } from './CategoryDistribution';
import { 
  Home, 
  MapPin, 
  Compass, 
  Cpu, 
  Tag, 
  Lightbulb, 
  ToggleLeft, 
  Thermometer, 
  Lock, 
  ChevronRight, 
  Eye, 
  LayoutGrid
} from 'lucide-react';
import { motion } from 'motion/react';

interface SpaceExplorerProps {
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
}

export default function SpaceExplorer({ devices, onSelectDevice }: SpaceExplorerProps) {
  // Get all unique property addresses
  const properties = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.propertyAddress))).filter(Boolean);
  }, [devices]);

  const [selectedProperty, setSelectedProperty] = useState<string>(properties[0] || '');

  // Filter devices by selected property
  const propertyDevices = useMemo(() => {
    return devices.filter(d => d.propertyAddress === selectedProperty);
  }, [devices, selectedProperty]);

  // Get all unique spaces in this property
  const spaces = useMemo(() => {
    const spaceMap = propertyDevices.reduce((acc, curr) => {
      acc[curr.space] = (acc[curr.space] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(spaceMap).map(name => ({
      name,
      count: spaceMap[name]
    }));
  }, [propertyDevices]);

  // Handle first default room
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const activeSpace = selectedSpace || (spaces[0]?.name || '');

  // Set default if property changes and old selectedSpace doesn't exist
  React.useEffect(() => {
    if (spaces.length > 0) {
      const exists = spaces.some(s => s.name === selectedSpace);
      if (!exists) {
        setSelectedSpace(spaces[0].name);
      }
    } else {
      setSelectedSpace('');
    }
  }, [spaces, selectedSpace]);

  // Filter devices for selected space
  const roomDevices = useMemo(() => {
    return propertyDevices.filter(d => d.space === activeSpace);
  }, [propertyDevices, activeSpace]);

  // Helper: map room category icon
  const getSpaceIcon = (spaceName: string) => {
    const name = spaceName.toLowerCase();
    if (name.includes('客')) return '🛋️';
    if (name.includes('卧') || name.includes('房')) return '🛏️';
    if (name.includes('厨')) return '🍳';
    if (name.includes('卫') || name.includes('浴')) return '🚿';
    if (name.includes('阳')) return '☀️';
    if (name.includes('书')) return '📚';
    if (name.includes('餐')) return '🍽️';
    return '🚪';
  };

  // Live status helper for room console simulator
  const roomLiveStats = useMemo(() => {
    const lights = roomDevices.filter(d => d.category === '灯光/回路');
    const curtains = roomDevices.filter(d => d.category === '窗帘/卷帘/门窗');
    const hvac = roomDevices.filter(d => d.category === '暖通/空调');
    const sensors = roomDevices.filter(d => d.category === '传感/环境');
    const locks = roomDevices.filter(d => d.category === '安防/门锁');

    return {
      lightsCount: lights.length,
      curtainsCount: curtains.length,
      hasHvac: hvac.length > 0,
      tempSensor: sensors.find(s => s.productName.includes('温湿度'))?.productName ? '24.5 °C' : '无传感器',
      humidity: sensors.find(s => s.productName.includes('温湿度'))?.productName ? '52%' : '无',
      hasRadar: sensors.some(s => s.productName.includes('雷达') || s.productName.includes('存在')),
      isLocked: locks.length > 0 ? '已上锁' : '未检测到智能锁'
    };
  }, [roomDevices]);

  return (
    <div className="space-y-8" id="space-explorer-tab">
      
      {/* Property Selector Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-800">切换当前物业项目</h2>
            <p className="text-xs text-neutral-500">根据 Excel 中物业地址列分设不同子项目进行查阅</p>
          </div>
        </div>

        <select
          id="property-select"
          value={selectedProperty}
          onChange={(e) => {
            setSelectedProperty(e.target.value);
            setSelectedSpace(''); // reset
          }}
          className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[240px] cursor-pointer transition"
        >
          {properties.length === 0 ? (
            <option>暂无项目地址</option>
          ) : (
            properties.map(p => (
              <option key={p} value={p}>{p}</option>
            ))
          )}
        </select>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          <Compass className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p className="text-sm font-semibold">暂无数据空间，请先在主页导入 Excel 设备表！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Spaces Sidebar Grid Selector (1/4 Column) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" />
              室内空间节点 ({spaces.length})
            </h3>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {spaces.map((sp) => {
                const isActive = sp.name === activeSpace;
                return (
                  <button
                    key={sp.name}
                    id={`btn-space-${sp.name}`}
                    onClick={() => setSelectedSpace(sp.name)}
                    className={`flex items-center justify-between shrink-0 px-4 py-3 rounded-xl border transition text-left cursor-pointer ${
                      isActive 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-md font-bold' 
                        : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700 hover:text-neutral-900 font-medium'
                    } min-w-[140px] lg:min-w-0 lg:w-full`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl leading-none">{getSpaceIcon(sp.name)}</span>
                      <span className="text-xs">{sp.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-600/50 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {sp.count} 台
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room View Main Stage (3/4 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Visual Smart Home Room Console Simulator */}
            <div className="bg-gradient-to-br from-neutral-50 to-indigo-50/30 rounded-2xl border border-indigo-100/50 p-6 shadow-sm">
              <div className="flex justify-between items-start pb-4 border-b border-indigo-100/40">
                <div>
                  <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                    <span className="text-2xl">{getSpaceIcon(activeSpace)}</span>
                    {activeSpace} 空间智慧面板模拟器
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    基于本房间物理硬件，推算当前空间联动状态与环境指标
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  系统已就绪
                </span>
              </div>

              {/* Console Dashboard Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
                {/* Lights control */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200/60 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center">
                    <Lightbulb className={`w-5 h-5 ${roomLiveStats.lightsCount > 0 ? 'text-amber-500' : 'text-neutral-400'}`} />
                    <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold">照明</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-neutral-400">智能灯光回路</p>
                    <p className="text-base font-bold text-neutral-800 mt-0.5">
                      {roomLiveStats.lightsCount > 0 ? `${roomLiveStats.lightsCount} 路负载` : '无负载'}
                    </p>
                  </div>
                </div>

                {/* Thermostat */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200/60 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center">
                    <Thermometer className={`w-5 h-5 ${roomLiveStats.hasHvac ? 'text-sky-500' : 'text-neutral-400'}`} />
                    <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold">温控</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-neutral-400">空调与地暖</p>
                    <p className="text-base font-bold text-neutral-800 mt-0.5">
                      {roomLiveStats.hasHvac ? '智能温控开启' : '未装配面板'}
                    </p>
                  </div>
                </div>

                {/* Environmental sensor values */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200/60 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center">
                    <Compass className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold">环境</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-neutral-400">室内湿度 / 存在感应</p>
                    <p className="text-base font-bold text-neutral-800 mt-0.5">
                      {roomLiveStats.tempSensor !== '无传感器' 
                        ? `${roomLiveStats.tempSensor} (${roomLiveStats.humidity})` 
                        : (roomLiveStats.hasRadar ? '监测人体微动' : '无传感器数据')}
                    </p>
                  </div>
                </div>

                {/* Alarm Locks */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200/60 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center">
                    <Lock className="w-5 h-5 text-rose-500" />
                    <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold">安防</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-neutral-400">门锁或防盗联动</p>
                    <p className="text-base font-bold text-neutral-800 mt-0.5">
                      {roomLiveStats.isLocked}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Devices in Room Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                本房间部署的物理智能设备台账 ({roomDevices.length} 台)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomDevices.map((device) => {
                  const catColor = CATEGORY_COLORS[device.category] || '#6b7280';
                  
                  return (
                    <motion.div
                      key={device.id}
                      whileHover={{ scale: 1.01 }}
                      id={`room-device-card-${device.id}`}
                      className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-200 transition relative overflow-hidden"
                    >
                      {/* Left vertical border matching category */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: catColor }}
                      />

                      {/* Card content */}
                      <div className="pl-2 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-neutral-800 hover:text-indigo-600 transition cursor-pointer" onClick={() => onSelectDevice && onSelectDevice(device)}>
                              {device.productName}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5 font-mono">{device.productModel || '未知型号'}</p>
                          </div>
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                            style={{ 
                              color: catColor, 
                              borderColor: `${catColor}30`, 
                              backgroundColor: `${catColor}10` 
                            }}
                          >
                            {device.category}
                          </span>
                        </div>

                        {/* Specs row */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                          <div>
                            <span className="text-neutral-400">通讯协议：</span>
                            <span className="text-neutral-700 font-mono">{device.businessType}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400">MAC地址：</span>
                            <span className="text-neutral-700 font-mono truncate block max-w-[120px]" title={device.mac}>
                              {device.mac || <span className="text-rose-500 font-bold">缺失</span>}
                            </span>
                          </div>
                        </div>

                        {/* Capabilities Tags */}
                        {device.capabilities && device.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {device.capabilities.slice(0, 3).map((cap) => (
                              <span 
                                key={cap} 
                                className="bg-neutral-100 hover:bg-neutral-200/60 text-neutral-600 px-1.5 py-0.5 rounded text-[9px] font-bold transition flex items-center gap-0.5"
                              >
                                <Tag className="w-2.5 h-2.5 text-neutral-400" />
                                {cap}
                              </span>
                            ))}
                            {device.capabilities.length > 3 && (
                              <span className="bg-neutral-50 text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                +{device.capabilities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action trigger button */}
                      <div className="pl-2 pt-2 border-t border-neutral-100 flex justify-end">
                        <button
                          onClick={() => onSelectDevice && onSelectDevice(device)}
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> 字典详情卡片
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
