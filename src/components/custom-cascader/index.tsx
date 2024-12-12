import React, { useState, useEffect } from 'react';
import { Cascader, CascaderProps } from 'antd';
const { SHOW_CHILD } = Cascader;

interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

const findPath = (options: CascaderOption[], value: string): string[] => {
  const path: string[] = [];
  const find = (opts: CascaderOption[], val: string): boolean => {
    for (const opt of opts) {
      if (opt.value === val) {
        path.push(opt.value);
        return true;
      }
      if (opt.children && find(opt.children, val)) {
        path.push(opt.value);
        return true;
      }
    }
    return false;
  };
  find(options, value);
  return path.reverse();
};

interface CustomCascaderProps
  extends Omit<CascaderProps<any>, 'value' | 'onChange'> {
  value?: string[] | string;
  onChange?: (value: string[] | string) => void;
  multiple?: boolean;
}

const CustomCascader: React.FC<CustomCascaderProps> = ({
  value = [],
  onChange,
  options = [],
  multiple = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState<string[][] | string[]>(
    multiple ? [] : []
  );

  useEffect(() => {
    console.log(value);
    if (value?.length) {
      if (multiple) {
        const paths = (value as string[]).map((val) => findPath(options, val));
        setInternalValue(paths);
      } else {
        const path = findPath(options, value as string);
        setInternalValue(path);
      }
    }
  }, [value, options, multiple]);

  const handleChange = (values: any) => {
    if (multiple) {
      const leafValues = values.map(
        (valueArray: string[]) => valueArray[valueArray.length - 1]
      );
      setInternalValue(values);
      if (onChange) {
        onChange(leafValues);
      }
    } else {
      const leafValue = values[values.length - 1];
      setInternalValue(values);
      if (onChange) {
        onChange(leafValue);
      }
    }
  };

  return (
    <Cascader
      {...props}
      value={internalValue}
      onChange={handleChange}
      showCheckedStrategy={SHOW_CHILD}
      options={options}
      multiple={multiple as any}
    />
  );
};

export default CustomCascader;
