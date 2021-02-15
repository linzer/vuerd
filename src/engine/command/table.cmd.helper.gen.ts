import { Store } from '@@types/engine/store';
import { selectEndMemo } from './memo.cmd.helper';
import { selectEndTable, addTable, selectTable } from './table.cmd.helper';

export function* addTable$(store: Store) {
  yield selectEndTable();
  yield selectEndMemo();
  yield addTable(store);
}

export function* selectTable$(store: Store, ctrlKey: boolean, tableId: string) {
  yield selectTable(store, ctrlKey, tableId);
  if (!ctrlKey) {
    yield selectEndMemo();
  }
}
