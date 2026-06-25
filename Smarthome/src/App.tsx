/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Layers, 
  Compass, 
  BookOpen, 
  Network, 
  ShieldAlert,
  Cpu,
  RefreshCw,
  Zap,
  Github
} from 'lucide-react';
import { Device, DataQualityReport } from './types';
import { INITIALIZED_DEVICES, analyzeDataQuality, enrichDevices, DEFAULT_DEVICES } from './data/deviceData';

// Component Imports
import Dashboard from './components/Dashboard';
import CategoryDistribution from './components/CategoryDistribution';
import SpaceExplorer from './components/SpaceExplorer';
import DeviceDictionary from './components/DeviceDictionary';
import RelationshipGraph from './components/RelationshipGraph';
import DataQuality from './components/DataQuality';

import { motion } from 'motion/react';

export default function App() {
  // Global Database State
  const [devices, setDevices] = useState<Device[]>(INITIALIZED_DEVICES);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Selection and Drill-down States
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [onFilterCategory, setOnFilterCategory] = useState<string | null>(null);

  // Real-time Data Quality report
  const qualityReport = useMemo(() => {
    return analyzeDataQuality(devices);
  }, [devices]);

  // Handle drill down to dictionary from category distribution clicks
  const handleSelectCategoryFromChart = (categoryName: string) => {
    setOnFilterCategory(categoryName);
    setActiveTab('dictionary');
  };

  // Handle drill down to details from clicking device items
  const handleSelectDevice = (device: Device | null) => {
    setSelectedDevice(device);
    if (device && activeTab !== 'dictionary') {
      setActiveTab('dictionary');
    }
  };

  const handleDevicesChange = (newDevices: Device[]) => {
    setDevices(newDevices);
    setSelectedDevice(null);
  };

  // Nav items configuration
  const navigationItems = [
    { id: 'dashboard', label: '大盘看板', icon: Database },
    { id: 'categories', label: '品类构成', icon: Layers },
    { id: 'explorer', label: '空间浏览', icon: Compass },
    { id: 'dictionary', label: '设备字典', icon: BookOpen },
    { id: 'relationship', label: '拓扑图谱', icon: Network },
    { id: 'quality', label: '质检洗数', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased flex flex-col justify-between">
      
      {/* Top Main Navigation Header */}
      <header className="bg-neutral-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-inner flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">智能家居设备数字字典</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">
                  IoT Asset Ledger
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-neutral-800 border border-neutral-700/80 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-[11px] font-medium text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>全盘设备：<strong>{devices.length}</strong> 台</span>
              </div>
              <div className={`border rounded-xl px-3 py-1.5 flex items-center space-x-2 text-[11px] font-bold ${
                qualityReport.qualityScore >= 85 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                  : 'bg-rose-950/40 border-rose-800 text-rose-400'
              }`}>
                <span>数据质量：<strong>{qualityReport.qualityScore}分</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Switches row */}
        <div className="bg-neutral-800 border-t border-neutral-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <nav className="flex space-x-1 overflow-x-auto scrollbar-none py-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'dictionary') {
                        setOnFilterCategory(null);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-white text-neutral-900 shadow-md font-extrabold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50 font-medium'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main View Area Area */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex-grow">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'dashboard' && (
            <Dashboard 
              devices={devices}
              qualityReport={qualityReport}
              onDevicesChange={handleDevicesChange}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setOnFilterCategory(null);
              }}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryDistribution 
              devices={devices}
              onSelectCategory={handleSelectCategoryFromChart}
            />
          )}

          {activeTab === 'explorer' && (
            <SpaceExplorer 
              devices={devices}
              onSelectDevice={handleSelectDevice}
            />
          )}

          {activeTab === 'dictionary' && (
            <DeviceDictionary 
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
              onFilterCategory={onFilterCategory}
            />
          )}

          {activeTab === 'relationship' && (
            <RelationshipGraph 
              devices={devices}
            />
          )}

          {activeTab === 'quality' && (
            <DataQuality 
              devices={devices}
              qualityReport={qualityReport}
              onSelectDevice={handleSelectDevice}
            />
          )}
        </motion.div>
      </main>

      {/* Footer bar */}
      <footer className="bg-neutral-900 text-neutral-500 text-xs py-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-bold text-neutral-400 flex items-center justify-center md:justify-start gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              智能家居设备数字字典系统 v1.2.0
            </p>
            <p className="text-[10px]">基于交付物料表清洗与能力特征关联，为工程落地降本增效</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>数据格式规范：GB/T-34098 兼容型 </span>
            <span className="text-neutral-700">|</span>
            <span>技术栈：React + Vite + Recharts + SheetJS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
