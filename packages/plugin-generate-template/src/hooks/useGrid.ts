import { cloneDeep, debounce } from 'lodash';
import { observe, reaction } from 'mobx';
import { Ref } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import Grid from 'tui-grid';

import { GridTextEditor } from '@/components/grid/GridTextEditor';
import { GridTextRender } from '@/components/grid/GridTextRender';
import { DataType } from '@/core/indexedDB';
import { useContext } from '@/hooks/useContext';

type GridTuple = readonly [Ref<any>, { current: Grid }];

const gridColumns: any = [
  {
    header: 'Name',
    name: 'name',
    renderer: { type: GridTextRender, options: { placeholder: 'name' } },
    editor: { type: GridTextEditor, options: { placeholder: 'name' } },
  },
  {
    header: 'Type',
    name: 'primitiveType',
    renderer: { type: GridTextRender, options: { placeholder: 'type' } },
    editor: { type: GridTextEditor, options: { placeholder: 'type' } },
  },
].map((gridColumn: any) => ({
  ...gridColumn,
  sortingType: 'asc',
  sortable: true,
}));

export function useGrid(): GridTuple {
  const parentRef = useRef<HTMLElement>();
  const gridRef = useRef<Grid>() as { current: Grid };
  const editRef = useRef(false);
  const { stores, keydown$ } = useContext();

  const getHeight = () => stores.ui.viewport.height - 30;
  const getData = () => cloneDeep(stores.dataType.dataTypes) as any;

  const onAfterChange = (event: any) => {
    const grid = gridRef.current;
    const { rowKey } = event;
    const row = grid.getRow(rowKey) as DataType | null;

    if (row) {
      const { uuid, name, primitiveType } = row;

      switch (event.columnName) {
        case 'name':
        case 'primitiveType':
          stores.dataType.update({
            uuid,
            name,
            primitiveType,
          });
          break;
      }
    }

    grid.clearModifiedData();
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (!gridRef.current) return;
    const grid = gridRef.current;

    if (
      !editRef.current &&
      (event.key === 'Delete' || event.key === 'Backspace')
    ) {
      const updatedRows = grid.getModifiedRows().updatedRows;
      if (!updatedRows) return;

      updatedRows.forEach(({ uuid, name, primitiveType }: any) => {
        stores.dataType.update({
          uuid,
          name,
          primitiveType,
        });
      });
    }

    grid.clearModifiedData();
  };

  const onEditingStart = () => (editRef.current = true);
  const onEditingFinish = () => (editRef.current = false);
  const onGridEvent = () => {
    if (!gridRef.current) return;
    gridRef.current.on('editingStart', onEditingStart);
    gridRef.current.on('editingFinish', onEditingFinish);
  };
  const offGridEvent = () => {
    if (!gridRef.current) return;
    gridRef.current.off('editingStart', onEditingStart);
    gridRef.current.off('editingFinish', onEditingFinish);
  };

  useEffect(() => {
    gridRef.current = new Grid({
      el: parentRef.current as HTMLElement,
      usageStatistics: false,
      bodyHeight: getHeight(),
      columns: gridColumns.map((gridColumn: any) => ({
        ...gridColumn,
        onAfterChange,
      })),
      data: getData(),
    });

    const subscription = keydown$.subscribe(onKeydown);
    const disposers = [
      observe(stores.ui.viewport, () =>
        gridRef.current.setBodyHeight(getHeight())
      ),
      reaction(
        () => stores.dataType.dataTypes.length,
        debounce(() => gridRef.current.resetData(getData()), 200)
      ),
    ];
    onGridEvent();

    return () => {
      disposers.forEach(f => f());
      subscription.unsubscribe();
      if (!gridRef.current) return;
      offGridEvent();
      gridRef.current.destroy();
    };
  }, []);

  return [parentRef, gridRef];
}
