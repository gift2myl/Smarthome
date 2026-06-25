/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Device, DeviceCategory, DataQualityReport } from '../types';

// Category Inference Engine
export function inferCategory(name: string, model: string): DeviceCategory {
  const text = (name + ' ' + model).toLowerCase();

  // 1. 中控/网关
  if (
    text.includes('网关') ||
    text.includes('中控') ||
    text.includes('主机') ||
    text.includes('智控') ||
    text.includes('服务器') ||
    text.includes('路由') ||
    text.includes('gateway') ||
    text.includes('触控屏') ||
    text.includes('中控屏') ||
    text.includes('智能屏') ||
    text.includes('中心')
  ) {
    return '中控/网关';
  }

  // 2. 暖通/空调
  if (
    text.includes('空调') ||
    text.includes('温控') ||
    text.includes('地暖') ||
    text.includes('新风') ||
    text.includes('暖通') ||
    text.includes('风扇') ||
    text.includes('排风') ||
    text.includes('vrf') ||
    text.includes('hvac') ||
    text.includes('thermostat')
  ) {
    return '暖通/空调';
  }

  // 3. 灯光/回路
  if (
    text.includes('灯') ||
    text.includes('回路') ||
    text.includes('射灯') ||
    text.includes('筒灯') ||
    text.includes('灯带') ||
    text.includes('光源') ||
    text.includes('调光') ||
    text.includes('吊灯') ||
    text.includes('吸顶') ||
    text.includes('射模块') ||
    text.includes('照明') ||
    text.includes('led')
  ) {
    return '灯光/回路';
  }

  // 4. 开关面板
  if (
    text.includes('开关') ||
    text.includes('面板') ||
    text.includes('按键') ||
    text.includes('按钮') ||
    text.includes('场景') ||
    text.includes('机械') ||
    text.includes('控制面板')
  ) {
    return '开关面板';
  }

  // 5. 插座/计量
  if (
    text.includes('插座') ||
    text.includes('计量') ||
    text.includes('排插') ||
    text.includes('插线') ||
    text.includes('用电') ||
    text.includes('电源') ||
    text.includes('socket') ||
    text.includes('能耗')
  ) {
    return '插座/计量';
  }

  // 6. 窗帘/卷帘/门窗
  if (
    text.includes('窗帘') ||
    text.includes('卷帘') ||
    text.includes('电机') ||
    text.includes('开窗') ||
    text.includes('推窗') ||
    text.includes('遮阳') ||
    text.includes('卷闸') ||
    text.includes('门窗') ||
    text.includes('curtain')
  ) {
    return '窗帘/卷帘/门窗';
  }

  // 7. 传感/环境
  if (
    text.includes('传感') ||
    text.includes('温湿度') ||
    text.includes('人体') ||
    text.includes('照度') ||
    text.includes('光照') ||
    text.includes('水浸') ||
    text.includes('溢水') ||
    text.includes('pm2') ||
    text.includes('环境') ||
    text.includes('雷达') ||
    text.includes('动静') ||
    text.includes('气体') ||
    text.includes('二氧化碳') ||
    text.includes('co2') ||
    text.includes('sensor') ||
    text.includes('存在')
  ) {
    return '传感/环境';
  }

  // 8. 安防/门锁
  if (
    text.includes('锁') ||
    text.includes('门禁') ||
    text.includes('安防') ||
    text.includes('摄像') ||
    text.includes('猫眼') ||
    text.includes('报警') ||
    text.includes('监控') ||
    text.includes('烟感') ||
    text.includes('燃气') ||
    text.includes('震动') ||
    text.includes('红外幕') ||
    text.includes('防盗')
  ) {
    return '安防/门锁';
  }

  return '其他/待归类';
}

// Capabilities Inference Engine
export function inferCapabilities(name: string, model: string): string[] {
  const text = (name + ' ' + model).toLowerCase();
  const caps: string[] = [];

  // Base capability mapping
  if (text.includes('网关') || text.includes('中控') || text.includes('主机')) {
    caps.push('中枢路由', '多协议适配', '离线控制', '设备接入');
  }
  if (text.includes('开关') || text.includes('面板') || text.includes('插座') || text.includes('灯')) {
    caps.push('开关控制', '状态同步');
  }
  if (text.includes('调光') || text.includes('射灯') || text.includes('筒灯') || text.includes('led')) {
    caps.push('无极调光', '冷暖色温调节', '光线渐变');
  }
  if (text.includes('计量') || text.includes('插座') || text.includes('用电')) {
    caps.push('功耗检测', '电量累计', '过载保护');
  }
  if (text.includes('窗帘') || text.includes('电机') || text.includes('卷帘')) {
    caps.push('开合百分比调节', '手动微启', '阻力停止', '静音运行');
  }
  if (text.includes('温控') || text.includes('空调') || text.includes('地暖')) {
    caps.push('温度设定', '风速调节', '模式切换', '阀门联动');
  }
  if (text.includes('温湿度') || text.includes('环境')) {
    caps.push('高精度测温', '湿度监测', '周期数据上报');
  }
  if (text.includes('人体') || text.includes('雷达') || text.includes('存在')) {
    caps.push('微动识别', '照度检测', '呼吸存在监测', '秒级响应');
  }
  if (text.includes('锁') || text.includes('门锁')) {
    caps.push('指纹解锁', '密码解锁', '临时密码', '防撬报警', '低电量告警');
  }
  if (text.includes('摄像') || text.includes('猫眼') || text.includes('监控')) {
    caps.push('1080P高清', '夜视功能', '人形跟踪', '双向通话', '云端存储');
  }
  if (text.includes('水浸') || text.includes('烟感') || text.includes('燃气')) {
    caps.push('异常声光告警', '远程通知', '联动阀门切断');
  }

  // Common modern tags if empty
  if (caps.length === 0) {
    caps.push('远程控制', '定时执行');
  } else {
    caps.push('远程控制');
  }

  // Protocol indicator
  if (text.includes('zigbee') || model.includes('zb')) {
    caps.push('Zigbee 3.0');
  } else if (text.includes('wifi') || text.includes('wi-fi')) {
    caps.push('Wi-Fi 2.4G');
  } else if (text.includes('ble') || text.includes('蓝牙') || model.includes('ble')) {
    caps.push('蓝牙Mesh');
  } else if (text.includes('knx')) {
    caps.push('KNX总线');
  } else if (text.includes('plc')) {
    caps.push('电力载波(PLC)');
  }

  return [...new Set(caps)];
}

// Sample Devices Generator
export const DEFAULT_DEVICES: Device[] = [
  // --- Project A: 绿城西溪诚园 1号楼201室 ---
  {
    id: 1,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "智能中控屏 10寸",
    productModel: "SP-10-PRO",
    deviceId: "DEV-GW-98231",
    businessType: "Wi-Fi + BLE Mesh",
    mac: "00:E0:4C:68:01:11",
    posRank1: 1,
    category: "中控/网关",
    capabilities: []
  },
  {
    id: 2,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "Zigbee智能多功能网关",
    productModel: "GW-ZB30-E",
    deviceId: "DEV-GW-98232",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:22",
    posRank1: 2,
    category: "中控/网关",
    capabilities: []
  },
  {
    id: 3,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "四路双向调光控制器",
    productModel: "DM-KNX-4CH",
    deviceId: "DEV-LT-1002",
    businessType: "KNX总线",
    mac: "00:E0:4C:68:01:33",
    posRank1: 3,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 4,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "超薄防眩全彩射灯 (暖白)",
    productModel: "SD-RGBW-V4",
    deviceId: "DEV-LT-1004",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:44",
    posRank1: 4,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 5,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "超薄防眩全彩射灯 (冷白)",
    productModel: "SD-RGBW-V4",
    deviceId: "DEV-LT-1005",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:45",
    posRank1: 5,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 6,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "智能四键触控场景面板 (香槟金)",
    productModel: "SW-SC4-G",
    deviceId: "DEV-MB-3011",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:66",
    posRank1: 6,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 7,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "智能双键开关面板 (静音版)",
    productModel: "SW-DB2-S",
    deviceId: "DEV-MB-3012",
    businessType: "BLE Mesh",
    mac: "00:E0:4C:68:01:67",
    posRank1: 7,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 8,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "16A大功率智能插座 (带计量)",
    productModel: "SK-MET-16A",
    deviceId: "DEV-CZ-2011",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:88",
    posRank1: 8,
    category: "插座/计量",
    capabilities: []
  },
  {
    id: 9,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "智能五孔插座面板 (暗装)",
    productModel: "SK-5P-ZB",
    deviceId: "DEV-CZ-2012",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:89",
    posRank1: 9,
    category: "插座/计量",
    capabilities: []
  },
  {
    id: 10,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "超静音智能开合窗帘电机",
    productModel: "CL-M-SILENT",
    deviceId: "DEV-CL-5011",
    businessType: "Wi-Fi",
    mac: "00:E0:4C:68:01:99",
    posRank1: 10,
    category: "窗帘/卷帘/门窗",
    capabilities: []
  },
  {
    id: 11,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "三合一多功能暖通温控器",
    productModel: "AC-KNX-V2",
    deviceId: "DEV-NT-4011",
    businessType: "KNX总线",
    mac: "00:E0:4C:68:01:AA",
    posRank1: 11,
    category: "暖通/空调",
    capabilities: []
  },
  {
    id: 12,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "24GHz毫米波雷达人体存在传感器",
    productModel: "SN-RADAR-24G",
    deviceId: "DEV-CG-8011",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:BB",
    posRank1: 12,
    category: "传感/环境",
    capabilities: []
  },
  {
    id: 13,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "高精度环境温湿度传感器",
    productModel: "SN-TH-PRO",
    deviceId: "DEV-CG-8012",
    businessType: "BLE Mesh",
    mac: "00:E0:4C:68:01:BC",
    posRank1: 13,
    category: "传感/环境",
    capabilities: []
  },
  {
    id: 14,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "全功能人脸识别智能防盗门锁",
    productModel: "LK-FACE-V5",
    deviceId: "DEV-AF-7011",
    businessType: "Wi-Fi",
    mac: "00:E0:4C:68:01:CC",
    posRank1: 14,
    category: "安防/门锁",
    capabilities: []
  },
  {
    id: 15,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "红外入侵幕帘报警探测器",
    productModel: "SN-IR-ML",
    deviceId: "DEV-AF-7012",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:01:CD",
    posRank1: 15,
    category: "安防/门锁",
    capabilities: []
  },

  // --- 主卧 ---
  {
    id: 16,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卧",
    productName: "智能六键雕刻金属面板",
    productModel: "SW-METAL-6B",
    deviceId: "DEV-MB-3021",
    businessType: "KNX总线",
    mac: "00:E0:4C:68:02:11",
    posRank1: 16,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 17,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卧",
    productName: "无极高精度可调色温射灯",
    productModel: "SD-RGBW-V4",
    deviceId: "DEV-LT-1021",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:02:22",
    posRank1: 17,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 18,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卧",
    productName: "无极高精度可调色温筒灯",
    productModel: "TD-CCT-ZB",
    deviceId: "DEV-LT-1022",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:02:23",
    posRank1: 18,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 19,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卧",
    productName: "卧室电动窗帘双导轨电机",
    productModel: "CL-M-DUAL",
    deviceId: "DEV-CL-5021",
    businessType: "Wi-Fi",
    mac: "00:E0:4C:68:02:44",
    posRank1: 19,
    category: "窗帘/卷帘/门窗",
    capabilities: []
  },
  {
    id: 20,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卧",
    productName: "卧室二合一地暖空调控制器",
    productModel: "AC-KNX-V2",
    deviceId: "DEV-NT-4021",
    businessType: "KNX总线",
    mac: "00:E0:4C:68:02:55",
    posRank1: 20,
    category: "暖通/空调",
    capabilities: []
  },
  {
    id: 21,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卧",
    productName: "光照人体存在传感器 (顶装)",
    productModel: "SN-RADAR-24G",
    deviceId: "DEV-CG-8021",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:02:66",
    posRank1: 21,
    category: "传感/环境",
    capabilities: []
  },

  // --- 次卧 ---
  {
    id: 22,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "次卧",
    productName: "智能三键按键开关 (哑光白)",
    productModel: "SW-KEYS3",
    deviceId: "DEV-MB-3031",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:03:11",
    posRank1: 22,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 23,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "次卧",
    productName: "LED柔性调光灯带控制器",
    productModel: "LT-STRIP-ZB",
    deviceId: "DEV-LT-1031",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:03:22",
    posRank1: 23,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 24,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "次卧",
    productName: "光照及人体红外探头",
    productModel: "SN-PIR-LITE",
    deviceId: "DEV-CG-8031",
    businessType: "BLE Mesh",
    mac: "00:E0:4C:68:03:33",
    posRank1: 24,
    category: "传感/环境",
    capabilities: []
  },

  // --- 厨房 ---
  {
    id: 25,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "厨房",
    productName: "智能厨房双联防潮开关",
    productModel: "SW-WATERPROOF",
    deviceId: "DEV-MB-3041",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:04:11",
    posRank1: 25,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 26,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "厨房",
    productName: "高能灵敏度无线水浸传感器",
    productModel: "SN-WATER-V2",
    deviceId: "DEV-CG-8041",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:04:22",
    posRank1: 26,
    category: "传感/环境",
    capabilities: []
  },
  {
    id: 27,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "厨房",
    productName: "家用可燃气体泄漏报警器",
    productModel: "SN-GAS-CH4",
    deviceId: "DEV-AF-7041",
    businessType: "Wi-Fi",
    mac: "00:E0:4C:68:04:33",
    posRank1: 27,
    category: "安防/门锁",
    capabilities: []
  },

  // --- 主卫 ---
  {
    id: 28,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卫",
    productName: "卫浴智能三回路调光模块",
    productModel: "DM-PLC-3CH",
    deviceId: "DEV-LT-1051",
    businessType: "电力载波(PLC)",
    mac: "00:E0:4C:68:05:11",
    posRank1: 28,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 29,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卫",
    productName: "多功能镜前场景双键面板",
    productModel: "SW-MIRROR-S2",
    deviceId: "DEV-MB-3051",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:05:22",
    posRank1: 29,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 30,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "主卫",
    productName: "卫浴雷达人体吸顶存在雷达",
    productModel: "SN-RADAR-24G",
    deviceId: "DEV-CG-8051",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:05:33",
    posRank1: 30,
    category: "传感/环境",
    capabilities: []
  },


  // --- Project B: 中海潮鸣 3号楼1204室 ---
  {
    id: 31,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "客厅",
    productName: "智能主机高级网关 旗舰版",
    productModel: "GW-GW-FLAGSHIP",
    deviceId: "DEV-ZH-GW-01",
    businessType: "Wi-Fi",
    mac: "10:D0:6B:43:AB:11",
    posRank1: 1,
    category: "中控/网关",
    capabilities: []
  },
  {
    id: 32,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "客厅",
    productName: "LED全彩智能驱动电源 (KNX)",
    productModel: "DRV-LED-KNX",
    deviceId: "DEV-ZH-LT-01",
    businessType: "KNX总线",
    mac: "10:D0:6B:43:AB:22",
    posRank1: 2,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 33,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "客厅",
    productName: "六按键高端触控黄铜场景面板",
    productModel: "SW-BRASS-6B",
    deviceId: "DEV-ZH-MB-01",
    businessType: "KNX总线",
    mac: "10:D0:6B:43:AB:33",
    posRank1: 3,
    category: "开关面板",
    capabilities: []
  },
  {
    id: 34,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "客厅",
    productName: "智能窗帘轨道开合器",
    productModel: "CL-ZH-M1",
    deviceId: "DEV-ZH-CL-01",
    businessType: "BLE Mesh",
    mac: "10:D0:6B:43:AB:44",
    posRank1: 4,
    category: "窗帘/卷帘/门窗",
    capabilities: []
  },
  {
    id: 35,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "客厅",
    productName: "智能防烧大功率计量插座",
    productModel: "SK-MET-16A",
    deviceId: "DEV-ZH-CZ-01",
    businessType: "Zigbee",
    mac: "10:D0:6B:43:AB:55",
    posRank1: 5,
    category: "插座/计量",
    capabilities: []
  },
  {
    id: 36,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "餐厅",
    productName: "三回路调光执行器 (KNX)",
    productModel: "DM-KNX-4CH",
    deviceId: "DEV-ZH-LT-02",
    businessType: "KNX总线",
    mac: "10:D0:6B:43:AB:66",
    posRank1: 6,
    category: "灯光/回路",
    capabilities: []
  },
  {
    id: 37,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "餐厅",
    productName: "智能温湿度+光照度二合一探头",
    productModel: "SN-TH-PRO",
    deviceId: "DEV-ZH-CG-01",
    businessType: "BLE Mesh",
    mac: "10:D0:6B:43:AB:77",
    posRank1: 7,
    category: "传感/环境",
    capabilities: []
  },
  {
    id: 38,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "主卧",
    productName: "智能静音窗帘电机 (双轨道)",
    productModel: "CL-ZH-M1",
    deviceId: "DEV-ZH-CL-02",
    businessType: "BLE Mesh",
    mac: "10:D0:6B:43:AB:88",
    posRank1: 8,
    category: "窗帘/卷帘/门窗",
    capabilities: []
  },
  {
    id: 39,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "主卧",
    productName: "五合一全效吸顶空气质量监测仪",
    productModel: "SN-AIR-5IN1",
    deviceId: "DEV-ZH-CG-02",
    businessType: "Wi-Fi",
    mac: "10:D0:6B:43:AB:99",
    posRank1: 9,
    category: "传感/环境",
    capabilities: []
  },
  {
    id: 40,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "主卫",
    productName: "智能镜面调温地暖加热阀门控制器",
    productModel: "AC-ZH-VALVE",
    deviceId: "DEV-ZH-NT-01",
    businessType: "PLC",
    mac: "10:D0:6B:43:AB:AA",
    posRank1: 10,
    category: "暖通/空调",
    capabilities: []
  },

  // --- DATA QUALITY ISSUES (Simulated for audit tools) ---
  // 1. Duplicated MAC Address (1) - Guest Room 1
  {
    id: 41,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "书房",
    productName: "书房调光台灯",
    productModel: "LT-DESK-ZB",
    deviceId: "DEV-LT-DUP-1",
    businessType: "Zigbee",
    mac: "99:AA:88:77:66:55", // Duplicate MAC with #42
    posRank1: 31,
    category: "灯光/回路",
    capabilities: []
  },
  // 2. Duplicated MAC Address (2) - Guest Room 2
  {
    id: 42,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "阳台",
    productName: "阳台补光照明灯",
    productModel: "LT-BALCONY",
    deviceId: "DEV-LT-DUP-2",
    businessType: "Zigbee",
    mac: "99:AA:88:77:66:55", // Duplicate MAC with #41
    posRank1: 32,
    category: "灯光/回路",
    capabilities: []
  },
  // 3. Duplicated MAC Address (3) - Another project
  {
    id: 43,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "书房",
    productName: "书房极速无线智能AP面板",
    productModel: "AP-5G-MESH",
    deviceId: "DEV-AP-DUP-1",
    businessType: "Wi-Fi",
    mac: "AA:BB:CC:11:22:33", // Duplicate MAC with #44
    posRank1: 11,
    category: "中控/网关",
    capabilities: []
  },
  {
    id: 44,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "次卧",
    productName: "次卧智能AP信号扩展器",
    productModel: "AP-5G-MESH",
    deviceId: "DEV-AP-DUP-2",
    businessType: "Wi-Fi",
    mac: "AA:BB:CC:11:22:33", // Duplicate MAC with #43
    posRank1: 12,
    category: "中控/网关",
    capabilities: []
  },
  // 4. Missing Fields (Empty Mac)
  {
    id: 45,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "阳台",
    productName: "智能电动升降晾衣架",
    productModel: "CL-LYJ-V1",
    deviceId: "DEV-CL-5044",
    businessType: "Wi-Fi",
    mac: "", // Missing MAC Address
    posRank1: 33,
    category: "窗帘/卷帘/门窗",
    capabilities: []
  },
  // 5. Missing Fields (Empty Model)
  {
    id: 46,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "厨房",
    productName: "未知厨房水管漏水感应器",
    productModel: "", // Missing Model
    deviceId: "DEV-ZH-CG-MISS",
    businessType: "Zigbee",
    mac: "10:D0:6B:43:AB:EE",
    posRank1: 13,
    category: "传感/环境",
    capabilities: []
  },
  // 6. Virtual Device MAC Address
  {
    id: 47,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "天气预报虚拟中间件服务",
    productModel: "VM-WEATHER-SVR",
    deviceId: "DEV-VM-01",
    businessType: "虚拟总线",
    mac: "00:00:00:00:00:00", // Virtual MAC Indicator
    posRank1: 34,
    category: "中控/网关",
    capabilities: []
  },
  {
    id: 48,
    propertyAddress: "中海潮鸣 3号楼1204室",
    roomCode: "HZ-ZH-03-1204",
    space: "客厅",
    productName: "家庭娱乐云播放对接代理",
    productModel: "VM-CLOUD-PROXY",
    deviceId: "DEV-VM-02",
    businessType: "虚拟总线",
    mac: "FF:FF:FF:FF:FF:FF", // Virtual MAC Indicator
    posRank1: 14,
    category: "中控/网关",
    capabilities: []
  },
  // 7. Uncategorized Product
  {
    id: 49,
    propertyAddress: "绿城西溪诚园 1号楼201室",
    roomCode: "HZ-XC-01-201",
    space: "客厅",
    productName: "特制多功能调试套件 (未定级)",
    productModel: "X-DEBUG-99",
    deviceId: "DEV-X-99",
    businessType: "Zigbee",
    mac: "00:E0:4C:68:09:99",
    posRank1: 35,
    category: "其他/待归类", // Uncategorized
    capabilities: []
  }
];

// Enrich devices list with capabilities and categories if not defined
export function enrichDevices(devices: any[]): Device[] {
  return devices.map((d, index) => {
    const rawCategory = d.category || inferCategory(d.productName || d['产品名称'] || '', d.productModel || d['产品型号'] || '');
    const rawName = d.productName || d['产品名称'] || '';
    const rawModel = d.productModel || d['产品型号'] || '';

    return {
      id: Number(d.id || d['序号'] || (index + 1)),
      propertyAddress: String(d.propertyAddress || d['物业地址'] || '默认住宅'),
      roomCode: String(d.roomCode || d['房源编号'] || 'ROOM-001'),
      space: String(d.space || d['空间'] || '客厅'),
      productName: String(rawName),
      productModel: String(rawModel),
      deviceId: String(d.deviceId || d['设备编号'] || `DEV-${Math.floor(Math.random() * 100000)}`),
      businessType: String(d.businessType || d['业务类型'] || 'Zigbee'),
      mac: String(d.mac !== undefined ? d.mac : d['设备mac'] || ''),
      posRank1: d.posRank1 !== undefined ? d.posRank1 : d['posRank1'] || 1,
      category: rawCategory as DeviceCategory,
      capabilities: inferCapabilities(rawName, rawModel)
    };
  });
}

// Initial default initialized list
export const INITIALIZED_DEVICES: Device[] = enrichDevices(DEFAULT_DEVICES);

// Data Quality Analyzer Engine
export function analyzeDataQuality(devices: Device[]): DataQualityReport {
  const totalCount = devices.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      duplicateMacCount: 0,
      duplicateMacDetails: [],
      missingFieldsCount: 0,
      missingFieldsDetails: [],
      virtualDeviceCount: 0,
      uncategorizedCount: 0,
      qualityScore: 100
    };
  }

  // MAC counting for duplicates
  const macCounts: Record<string, number> = {};
  const missingFieldsDetails: { id: number; field: string; productName: string }[] = [];
  let virtualDeviceCount = 0;
  let uncategorizedCount = 0;

  devices.forEach(d => {
    // 1. MAC counts (skip empty MACs from duplicate detection, they go to missing fields)
    const cleanMac = d.mac.trim().toUpperCase();
    if (cleanMac) {
      macCounts[cleanMac] = (macCounts[cleanMac] || 0) + 1;
    }

    // 2. Missing fields check
    if (!d.mac || d.mac.trim() === '') {
      missingFieldsDetails.push({ id: d.id, field: '设备mac', productName: d.productName });
    }
    if (!d.productModel || d.productModel.trim() === '') {
      missingFieldsDetails.push({ id: d.id, field: '产品型号', productName: d.productName });
    }
    if (!d.productName || d.productName.trim() === '') {
      missingFieldsDetails.push({ id: d.id, field: '产品名称', productName: '未命名设备' });
    }
    if (!d.space || d.space.trim() === '') {
      missingFieldsDetails.push({ id: d.id, field: '空间', productName: d.productName });
    }

    // 3. Virtual MAC check
    const virtualMacs = ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', 'VIRTUAL', 'MOCK', '00:00:00:00', 'FF:FF:FF:FF'];
    const isVirtual = virtualMacs.some(v => cleanMac.includes(v)) || d.businessType.includes('虚拟');
    if (isVirtual) {
      virtualDeviceCount++;
    }

    // 4. Uncategorized check
    if (d.category === '其他/待归类' || !d.category) {
      uncategorizedCount++;
    }
  });

  // Collect duplicate MAC details
  const duplicateMacDetails = Object.keys(macCounts).filter(mac => macCounts[mac] > 1);
  // Calculate total duplicates devices involved
  let duplicateDevicesCount = 0;
  devices.forEach(d => {
    const cleanMac = d.mac.trim().toUpperCase();
    if (cleanMac && macCounts[cleanMac] > 1) {
      duplicateDevicesCount++;
    }
  });

  const missingFieldsCount = missingFieldsDetails.length;

  // Quality score formula:
  // Deduct based on issues
  // - Each duplicate MAC set: -5 points
  // - Each missing field: -2 points
  // - Each virtual device: -1 point
  // - Each uncategorized: -1 point
  let score = 100;
  score -= (duplicateMacDetails.length * 8);
  score -= (missingFieldsCount * 3);
  score -= (virtualDeviceCount * 2);
  score -= (uncategorizedCount * 2);

  const qualityScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    totalCount,
    duplicateMacCount: duplicateMacDetails.length,
    duplicateMacDetails,
    missingFieldsCount,
    missingFieldsDetails,
    virtualDeviceCount,
    uncategorizedCount,
    qualityScore
  };
}
