/**
 * 工地排班应用模拟数据
 */

// 工地类型定义
export interface Worksite {
  id: string;
  name: string;
  scheduledEmployees: Employee['id'][];
}

// 员工类型定义
export interface Employee {
  id: string;
  name: string;
  isOnLeave: boolean;
  avatarColor: string;
  score: number; // 员工评分(0-10)
  hasTool: boolean; // 是否有工具
}

// 初始工地数据
export const initialWorksites: Worksite[] = [
  {
    id: 'w1',
    name: '城东工地',
    scheduledEmployees: []
  }
];

// 初始员工数据 - 不包含默认数据
export const initialEmployees: Employee[] = [];