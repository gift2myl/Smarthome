/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Device {
  id: number;              // 序号
  propertyAddress: string; // 物业地址
  roomCode: string;        // 房源编号
  space: string;           // 空间
  productName: string;     // 产品名称
  productModel: string;    // 产品型号
  deviceId: string;        // 设备编号
  businessType: string;    // 业务类型
  mac: string;             // 设备mac
  posRank1: string | number; // posRank1
  category: DeviceCategory;  // 自动推断的分类
  capabilities: string[];  // 自动推断的设备能力标签
}

export type DeviceCategory =
  | '灯光/回路'
  | '开关面板'
  | '插座/计量'
  | '窗帘/卷帘/门窗'
  | '中控/网关'
  | '暖通/空调'
  | '传感/环境'
  | '安防/门锁'
  | '其他/待归类';

export interface DataQualityReport {
  totalCount: number;
  duplicateMacCount: number;
  duplicateMacDetails: string[]; // List of MACs that are duplicated
  missingFieldsCount: number;
  missingFieldsDetails: { id: number; field: string; productName: string }[];
  virtualDeviceCount: number;   // Devices with placeholder MACs like '00:00:00:00:00:00' or similar
  uncategorizedCount: number;
  qualityScore: number;         // Out of 100
}

export interface DictionaryFilters {
  searchQuery: string;
  space: string;
  category: string;
  businessType: string;
  hasQualityIssues: boolean;
}
