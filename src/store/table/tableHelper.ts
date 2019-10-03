import {SIZE_START_X, SIZE_START_Y, SIZE_START_ADD} from '@/ts/layout';
import {Table} from '../table';
import {Memo} from '../memo';
import {ColumnFocus} from '@/models/ColumnFocusModel';
import StoreManagement from '@/store/StoreManagement';

export function zIndexNext(tables: Table[], memos: Memo[]): number {
  let max = 1;
  tables.forEach((table: Table) => {
    if (max < table.ui.zIndex) {
      max = table.ui.zIndex;
    }
  });
  memos.forEach((memo: Memo) => {
    if (max < memo.ui.zIndex) {
      max = memo.ui.zIndex;
    }
  });
  return max + 1;
}

export function pointNext(store: StoreManagement, tables: Table[], memos: Memo[]): { top: number, left: number } {
  const point = {
    top: SIZE_START_Y + store.canvasStore.state.scrollTop,
    left: SIZE_START_X + store.canvasStore.state.scrollLeft,
  };
  let isPosition = true;
  while (isPosition) {
    isPosition = false;
    for (const table of tables) {
      if (table.ui.top === point.top && table.ui.left === point.left) {
        isPosition = true;
        point.top += SIZE_START_ADD;
        point.left += SIZE_START_ADD;
        break;
      }
    }
    for (const memo of memos) {
      if (memo.ui.top === point.top && memo.ui.left === point.left) {
        isPosition = true;
        point.top += SIZE_START_ADD;
        point.left += SIZE_START_ADD;
        break;
      }
    }
  }
  return point;
}

export function getSelect(focusColumns: ColumnFocus[]): {min: number, max: number} {
  const index = {
    min: -1,
    max: -1,
  };
  const len = focusColumns.length;
  for (let i = 0; i < len; i++) {
    if (focusColumns[i].selected) {
      if (index.min === -1 || index.min > i) {
        index.min = i;
      }
      if (index.max === -1 || index.max < i) {
        index.max = i;
      }
    }
  }
  return index;
}
