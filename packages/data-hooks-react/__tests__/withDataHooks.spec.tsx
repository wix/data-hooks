import * as React from 'react';
import { render } from '@testing-library/react';
import { withDataHooks, WithDataHooks } from '../src';
import { dataHooks } from '@wix/data-hooks';

describe('Data hooks HOC', () => {
  const cmpDataHooks = dataHooks<{ elem: { key: string } }>('cmp');
  const Cmp = jest.fn((() => null) as React.FC<WithDataHooks<typeof cmpDataHooks> & { dataHook?: string }>);
  const WrappedCmp = withDataHooks(cmpDataHooks)(Cmp);

  beforeEach(() => Cmp.mockClear());

  it('should call passed Cmp', () => {
    render(<WrappedCmp />);
    expect(Cmp).toBeCalled();
  });

  it('should pass all props as it is', () => {
    const props = { a: 'string', b: { key: 'object-value' }, fn: () => void 0 };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Cmp.mockImplementation(({ dataHooks, ...restProps }) => {
      expect(restProps).toEqual(props);
      return null;
    });
    // @ts-expect-error we pass more props than is in the type
    render(<WrappedCmp {...props} />);
    expect(Cmp).toBeCalled();
  });

  it('should pass dataHook prop as dataHooks.base()', () => {
    Cmp.mockImplementation((props) => {
      expect(props.dataHooks.base()).toEqual('parent-data-hook cmp__base');
      return null;
    });
    render(<WrappedCmp dataHook="parent-data-hook" />);
    expect(Cmp).toBeCalled();
  });

  it('should keep generator behavior', () => {
    Cmp.mockImplementation((props) => {
      expect(props.dataHooks.elem({ key: 'value' })).toEqual('cmp__elem elem--key_value');
      return null;
    });
    render(<WrappedCmp />);
    expect(Cmp).toBeCalled();
  });

  describe('types', () => {
    const hooks = dataHooks<{ elem: { one: string; two: string } }>('cmp');
    it('should force to pass all params', () => {
      withDataHooks(hooks)(({dataHooks} ) => {
        dataHooks.elem({ one: 'value', two: 'value' });

        // @ts-expect-error all elements are required
        dataHooks.elem({ one: 'value' });

        // @ts-expect-error all elements are required
        dataHooks.elem({});

        // @ts-expect-error options are required
        dataHooks.elem();
        return null;
      });
    });

    it('should not require any params if no options', () => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const hooksWithBase = dataHooks<{ elem: {} }>('cmp');
      withDataHooks(hooksWithBase)(({ dataHooks }) => {
        dataHooks.elem();
        return null;
      });
    });

    it('should not require any params for base', () => {
      withDataHooks(hooks)(({ dataHooks }) => {
        dataHooks.base();
        return null;
      });
    });

    it('should require params for base if such exists in data hooks', () => {
      const hooksWithBase = dataHooks<{ base: { key: string } }>('cmp');
      withDataHooks(hooksWithBase)(({ dataHooks }) => {
        dataHooks.base({ key: 'value' });

        // @ts-expect-error options should have all elements
        dataHooks.base({});

        // @ts-expect-error options are required if any
        dataHooks.base();
        return null;
      });
    });
  });
});
