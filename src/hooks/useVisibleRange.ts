import { useMemo } from 'react';
import type { Tab, TabOffsetMap } from '../interface';
import type { TabNavListProps } from '../TabNavList';

const DEFAULT_SIZE = { width: 0, height: 0, left: 0, top: 0, right: 0 };

export type ContainerSizeInfo = [width: number, height: number, left: number, top: number];

// 计算可视区域tab的起始和结束索引
export default function useVisibleRange(
  // 记录每个tab的位置信息
  tabOffsets: TabOffsetMap,
  // 水平方向 可以理解成 rc-tabs-nav-wrap 的宽度 
  visibleTabContentValue: number,
  // 水平方向 transformLeft
  transform: number,
  // tabs的宽度和
  tabContentSizeValue: number,
  addNodeSizeValue: number,
  operationNodeSizeValue: number,
  { tabs, tabPosition, rtl }: { tabs: Tab[] } & TabNavListProps,
): [visibleStart: number, visibleEnd: number] {

  let charUnit: 'width' | 'height';
  let position: 'left' | 'top' | 'right';
  let transformSize: number;

  if (['top', 'bottom'].includes(tabPosition)) {
    charUnit = 'width';
    position = rtl ? 'right' : 'left';
    transformSize = Math.abs(transform);
  } else {
    charUnit = 'height';
    position = 'top';
    transformSize = -transform;
  }

  return useMemo(() => {
    if (!tabs.length) {
      return [0, 0];
    }

    const len = tabs.length;
    let endIndex = len;
    for (let i = 0; i < len; i += 1) {
      const offset = tabOffsets.get(tabs[i].key) || DEFAULT_SIZE;
      // 这里不直接用left/right, 主要是考虑了 rtl 的情况
      if (offset[position] + offset[charUnit] > transformSize + visibleTabContentValue) {
        endIndex = i - 1;
        break;
      }
    }

    let startIndex = 0;
    for (let i = len - 1; i >= 0; i -= 1) {
      const offset = tabOffsets.get(tabs[i].key) || DEFAULT_SIZE;
      // 第一个 left 小于 translateX 的 tab 
      if (offset[position] < transformSize) {
        startIndex = i + 1;
        break;
      }
    }

    return startIndex >= endIndex ? [0, 0] : [startIndex, endIndex];
  }, [
    tabOffsets,
    visibleTabContentValue,
    tabContentSizeValue,
    addNodeSizeValue,
    operationNodeSizeValue,
    transformSize,
    tabPosition,
    tabs.map(tab => tab.key).join('_'),
    rtl,
  ]);
}
