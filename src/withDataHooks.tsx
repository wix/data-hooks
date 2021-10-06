import React from 'react';
import { useDataHooks } from './useDataHooks';
import { DataHookElements, DataHooks } from './dataHooks';

type DataHookElementsFromDH<T extends DataHooks<any>> = T extends DataHooks<infer Item> ? Item : never;

type CmpDataHooksGenerator<T extends DataHookElements> = {
  [Elem in keyof T]: keyof T[Elem] extends never ? () => string : (options: T[Elem]) => string;
};

export type WithDataHooks<T extends DataHooks<any>> = {
  dataHooks: CmpDataHooksGenerator<{ base: {} } & DataHookElementsFromDH<T>>;
};

export function withDataHooks<T extends DataHooks<any>>(dataHooks: T) {
  return <Props extends WithDataHooks<T> & { dataHook?: string }>(
    Cmp: React.ComponentType<Props>,
  ): React.FC<Omit<Props, keyof WithDataHooks<T>>> => (props) => {
    const result = useDataHooks(dataHooks, props.dataHook);
    // @ts-expect-error
    return <Cmp {...props} dataHooks={result.dataHooks} />;
  };
}
