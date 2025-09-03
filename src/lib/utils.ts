import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从工地名称中提取面积数值（"平"之前的数字）
 * @param name 工地名称
 * @returns 提取的面积数值，默认为0
 */
export function extractAreaFromName(name: string): number {
  // 匹配"平"之前的数字
  const match = name.match(/(\d+)平/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}
