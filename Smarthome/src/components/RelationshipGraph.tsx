/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Device, DeviceCategory } from '../types';
import { CATEGORY_COLORS } from './CategoryDistribution';
import { Network, MapPin, Compass, Tag, Cpu, Radio, ZoomIn, ZoomOut, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RelationshipGraphProps {
  devices: Device[];
}

export default function RelationshipGraph({ devices }: RelationshipGraphProps) {
  // Get properties
  const properties = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.propertyAddress))).filter(Boolean);
  }, [devices]);

  const [selectedProperty, setSelectedProperty] = useState<string>(properties[0] || '');

  // Filter devices by selected property
  const propertyDevices = useMemo(() => {
    return devices.filter(d => d.propertyAddress === selectedProperty);
  }, [devices, selectedProperty]);

  // Unique spaces in property
  const spaces = useMemo(() => {
    return Array.from(new Set(propertyDevices.map(d => d.space))).filter(Boolean);
  }, [propertyDevices]);

  const [selectedSpace, setSelectedSpace] = useState<string>(spaces[0] || '客厅');

  // Sync space if selected property changes and old selectedSpace is not in this project
  React.useEffect(() => {
    if (spaces.length > 0) {
      if (!spaces.includes(selectedSpace)) {
        setSelectedSpace(spaces[0]);
      }
    }
  }, [spaces, selectedSpace]);

  // Devices in Selected Space
  const spaceDevices = useMemo(() => {
    return propertyDevices.filter(d => d.space === selectedSpace);
  }, [propertyDevices, selectedSpace]);

  // Categories in this Space
  const categoriesInSpace = useMemo(() => {
    return Array.from(new Set(spaceDevices.map(d => d.category))).filter(Boolean);
  }, [spaceDevices]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const activeCategory = selectedCategory || (categoriesInSpace[0] || '');

  React.useEffect(() => {
    if (categoriesInSpace.length > 0) {
      if (!categoriesInSpace.includes(activeCategory)) {
        setSelectedCategory(categoriesInSpace[0]);
      }
    } else {
      setSelectedCategory('');
    }
  }, [categoriesInSpace, activeCategory]);

  // Models in Selected Category
  const modelsInCat = useMemo(() => {
    const catDevs = spaceDevices.filter(d => d.category === activeCategory);
    return Array.from(new Set(catDevs.map(d => d.productModel))).filter(Boolean);
  }, [spaceDevices, activeCategory]);

  const [selectedModel, setSelectedModel] = useState<string>('');
  const activeModel = selectedModel || (modelsInCat[0] || '');

  React.useEffect(() => {
    if (modelsInCat.length > 0) {
      if (!modelsInCat.includes(activeModel)) {
        setSelectedModel(modelsInCat[0]);
      }
    } else {
      setSelectedModel('');
    }
  }, [modelsInCat, activeModel]);

  // Instances under this Model
  const instancesInModel = useMemo(() => {
    return spaceDevices.filter(d => d.category === activeCategory && d.productModel === activeModel);
  }, [spaceDevices, activeCategory, activeModel]);

  // Compute SVG nodes for the focused slice
  // Columns:
  // Col 0: Property (1 node)
  // Col 1: Room (focused) (1 node, but show siblings for context)
  // Col 2: Category (focused) (1 node, show siblings)
  // Col 3: Model (focused) (1 node, show siblings)
  // Col 4: Instances (multiple nodes under focused model)
  const svgNodes = useMemo(() => {
    if (!selectedProperty) return { nodes: [], links: [] };

    const nodes: any[] = [];
    const links: any[] = [];

    // Coordinates layout
    const xStep = 180;
    const xOffset = 30;
    const yCenter = 180;

    // Col 0: Property Node
    const propertyNodeId = `prop-${selectedProperty}`;
    nodes.push({
      id: propertyNodeId,
      label: selectedProperty.slice(0, 10) + '...',
      fullName: selectedProperty,
      type: 'property',
      x: xOffset,
      y: yCenter,
      color: '#1f2937'
    });

    // Col 1: Space Rooms Nodes (centered layout)
    const spaceNodeYStart = yCenter - ((spaces.length - 1) * 55) / 2;
    spaces.forEach((sp, idx) => {
      const id = `space-${sp}`;
      const isSelected = sp === selectedSpace;
      const y = spaceNodeYStart + idx * 55;
      
      nodes.push({
        id,
        label: sp,
        fullName: `${selectedProperty} - ${sp}`,
        type: 'space',
        isSelected,
        x: xOffset + xStep,
        y,
        color: isSelected ? '#4f46e5' : '#9ca3af'
      });

      // Link property to all rooms
      links.push({ source: propertyNodeId, target: id, isHighlighted: isSelected });
    });

    // Col 2: Categories in selected space
    const selectedSpaceId = `space-${selectedSpace}`;
    const catNodeYStart = yCenter - ((categoriesInSpace.length - 1) * 55) / 2;
    categoriesInSpace.forEach((cat, idx) => {
      const id = `cat-${cat}`;
      const isSelected = cat === activeCategory;
      const y = catNodeYStart + idx * 55;
      
      nodes.push({
        id,
        label: cat,
        fullName: cat,
        type: 'category',
        isSelected,
        x: xOffset + xStep * 2,
        y,
        color: isSelected ? (CATEGORY_COLORS[cat as DeviceCategory] || '#4f46e5') : '#9ca3af'
      });

      // Link focused room to its categories
      links.push({ source: selectedSpaceId, target: id, isHighlighted: isSelected });
    });

    // Col 3: Models under focused Category
    const activeCatId = `cat-${activeCategory}`;
    const modelNodeYStart = yCenter - ((modelsInCat.length - 1) * 55) / 2;
    modelsInCat.forEach((model, idx) => {
      const id = `model-${model}`;
      const isSelected = model === activeModel;
      const y = modelNodeYStart + idx * 55;

      nodes.push({
        id,
        label: model.length > 12 ? model.slice(0, 12) + '..' : model,
        fullName: model,
        type: 'model',
        isSelected,
        x: xOffset + xStep * 3,
        y,
        color: isSelected ? '#10b981' : '#9ca3af'
      });

      // Link active category to models
      links.push({ source: activeCatId, target: id, isHighlighted: isSelected });
    });

    // Col 4: Instances under active Model
    const activeModelId = `model-${activeModel}`;
    const instNodeYStart = yCenter - ((instancesInModel.length - 1) * 55) / 2;
    instancesInModel.forEach((inst, idx) => {
      const id = `inst-${inst.id}`;
      const y = instNodeYStart + idx * 55;

      nodes.push({
        id,
        label: inst.productName.slice(0, 10) + (inst.productName.length > 10 ? '..' : ''),
        fullName: `${inst.productName} (${inst.mac || '无MAC'})`,
        type: 'instance',
        x: xOffset + xStep * 4,
        y,
        color: '#f59e0b',
        device: inst
      });

      // Link model to instances
      links.push({ source: activeModelId, target: id, isHighlighted: true });
    });

    return { nodes, links };
  }, [selectedProperty, selectedSpace, activeCategory, activeModel, spaces, categoriesInSpace, modelsInCat, instancesInModel]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 p-6 space-y-6" id="relationship-graph-tab">
      
      {/* Intro info */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-neutral-800">全维数字拓扑拓朴关系图谱</h2>
            <p className="text-xs text-neutral-500">
              数据链路层级透视：物业项目 → 室内空间 → 系统类别 → 硬件型号 → 设备物理实例
            </p>
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="p-12 text-center text-neutral-400">
          请在主页导入 Excel 设备数据库后查看关系图谱。
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Sidebar (4/12 columns) */}
          <div className="lg:col-span-4 bg-neutral-50 rounded-xl p-5 border border-neutral-200/60 space-y-4">
            <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">拓扑节点控制面板</h3>

            {/* Property select */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-600 font-bold block">1. 聚焦物业</label>
              <select
                id="graph-property-select"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full bg-white border border-neutral-300 text-neutral-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
              >
                {properties.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Space select */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-600 font-bold block">2. 聚焦房间空间</label>
              <div className="grid grid-cols-2 gap-2">
                {spaces.map(sp => (
                  <button
                    key={sp}
                    id={`graph-space-btn-${sp}`}
                    onClick={() => setSelectedSpace(sp)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold truncate transition cursor-pointer text-center ${
                      sp === selectedSpace 
                        ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                        : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Category select */}
            {categoriesInSpace.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                <label className="text-xs text-neutral-600 font-bold block">3. 聚焦系统类别</label>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesInSpace.map(cat => (
                    <button
                      key={cat}
                      id={`graph-cat-btn-${cat}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        cat === activeCategory
                          ? 'bg-neutral-900 text-white border-transparent shadow-sm'
                          : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model select */}
            {modelsInCat.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                <label className="text-xs text-neutral-600 font-bold block">4. 聚焦产品型号</label>
                <div className="flex flex-wrap gap-1.5">
                  {modelsInCat.map(model => (
                    <button
                      key={model}
                      id={`graph-model-btn-${model}`}
                      onClick={() => setSelectedModel(model)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        model === activeModel
                          ? 'bg-emerald-600 text-white border-transparent shadow-sm'
                          : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {model.length > 14 ? model.slice(0, 14) + '..' : model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="pt-4 border-t border-neutral-200 text-xs text-neutral-500 space-y-1 leading-relaxed">
              <p>📍 当前过滤范围包含 {spaceDevices.length} 台设备</p>
              <p>🔌 共发现 {categoriesInSpace.length} 个系统子类</p>
              <p>⚡ 正在渲染 {instancesInModel.length} 个底层具体物理设备</p>
            </div>
          </div>

          {/* Interactive SVG mindmap stage (8/12 columns) */}
          <div className="lg:col-span-8 bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex flex-col justify-between relative min-h-[400px]">
            
            {/* Legend indicator */}
            <div className="absolute left-4 top-4 bg-neutral-950/80 border border-neutral-800/80 px-3 py-2 rounded-lg text-[9px] text-neutral-400 space-y-1 z-10 flex flex-col">
              <span className="font-bold text-neutral-300 border-b border-neutral-800 pb-1 mb-1">层级节点定义</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> 物业项目层</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 室内空间层</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> 智能系统层</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 产品型号层</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 设备实例层</span>
            </div>

            {/* SVG mindmap stage canvas */}
            <div className="w-full flex-grow overflow-x-auto overflow-y-hidden scrollbar-none flex items-center justify-center">
              <svg 
                className="w-[800px] h-[360px]" 
                viewBox="0 0 800 360"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 1. Curved Connections/Links */}
                {svgNodes.links.map((link, idx) => {
                  const sourceNode = svgNodes.nodes.find(n => n.id === link.source);
                  const targetNode = svgNodes.nodes.find(n => n.id === link.target);
                  
                  if (!sourceNode || !targetNode) return null;

                  // Compute curved path
                  const x1 = sourceNode.x;
                  const y1 = sourceNode.y;
                  const x2 = targetNode.x;
                  const y2 = targetNode.y;
                  const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

                  return (
                    <g key={`link-${idx}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={link.isHighlighted ? '#6366f1' : '#374151'}
                        strokeWidth={link.isHighlighted ? 2 : 1}
                        strokeDasharray={targetNode.type === 'instance' ? '4 2' : 'none'}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}

                {/* 2. Interactive Circle Nodes */}
                {svgNodes.nodes.map((node) => {
                  const isInstance = node.type === 'instance';
                  const isHighlighted = node.isSelected || isInstance;

                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group select-none"
                      onClick={() => {
                        if (node.type === 'space') {
                          setSelectedSpace(node.label);
                        } else if (node.type === 'category') {
                          setSelectedCategory(node.label);
                        } else if (node.type === 'model') {
                          setSelectedModel(node.label);
                        }
                      }}
                    >
                      {/* Circle backdrop element */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isInstance ? 5 : 8}
                        fill={node.color}
                        stroke={isHighlighted ? '#ffffff' : '#4b5563'}
                        strokeWidth={isHighlighted ? 2 : 1}
                        className="transition-all duration-200 group-hover:scale-125"
                      />

                      {/* Ripple pulsing effect for highlighted nodes */}
                      {isHighlighted && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={15}
                          fill="none"
                          stroke={node.color}
                          strokeWidth={1}
                          opacity={0.3}
                          className="animate-ping"
                        />
                      )}

                      {/* Floating Text box labels */}
                      <text
                        x={node.x}
                        y={node.y - 14}
                        textAnchor="middle"
                        fill={isHighlighted ? '#ffffff' : '#9ca3af'}
                        fontSize={10}
                        fontWeight={isHighlighted ? 'bold' : 'normal'}
                        className="transition-colors pointer-events-none"
                      >
                        {node.label}
                      </text>

                      {/* Tooltip on hover */}
                      <title>{node.fullName}</title>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Topology bottom status explanation */}
            <div className="bg-neutral-950/60 rounded-lg p-3 text-[10px] text-neutral-400 flex items-center justify-between border-t border-neutral-800">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-neutral-500" />
                提示：点击图谱中的各级节点，可迅速激活聚焦链路。
              </span>
              <span className="text-neutral-500 font-mono">
                {selectedProperty && `${selectedProperty.slice(0, 8)}..`} / {selectedSpace} / {activeCategory}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
