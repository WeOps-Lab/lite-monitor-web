import { CascaderItem } from '@/types';

// 深克隆
export const deepClone = (obj: any, hash = new WeakMap()) => {
  if (Object(obj) !== obj) return obj;
  if (obj instanceof Set) return new Set(obj);
  if (hash.has(obj)) return hash.get(obj);

  const result =
    obj instanceof Date
      ? new Date(obj)
      : obj instanceof RegExp
        ? new RegExp(obj.source, obj.flags)
        : obj.constructor
          ? new obj.constructor()
          : Object.create(null);

  hash.set(obj, result);

  if (obj instanceof Map) {
    Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash)));
  }

  // 复制函数
  if (typeof obj === 'function') {
    return function (this: unknown, ...args: unknown[]): unknown {
      return obj.apply(this, args);
    };
  }

  // 递归复制对象的其他属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // File不做处理
      if (obj[key] instanceof File) {
        result[key] = obj[key];
        continue;
      }
      result[key] = deepClone(obj[key], hash);
    }
  }

  return result;
};

// 获取头像随机色
export const getRandomColor = () => {
  const colors = ['#875CFF', '#FF9214', '#00CBA6', '#1272FF'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

// 获取随机颜色
export const generateUniqueRandomColor = (() => {
  const generatedColors = new Set<string>();
  return (): string => {
    const letters = '0123456789ABCDEF';
    let color;
    do {
      color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
    } while (generatedColors.has(color));
    generatedColors.add(color);
    return color;
  };
})();

// 针对层级组件，当值为最后一级的value时的回显，需要找到其所有父value并转成的数组格式vaule
export const findCascaderPath = (
  nodes: CascaderItem[],
  targetValue: string,
  path: Array<string | number> = []
): Array<string | number> => {
  for (const node of nodes) {
    // 如果找到目标值，返回当前路径加上目标值
    if (node.value === targetValue) {
      return [...path, node.value];
    }
    // 如果有子节点，递归查找
    if (node.children) {
      const result = findCascaderPath(node.children, targetValue, [
        ...path,
        node.value,
      ]);
      // 如果在子节点中找到了目标值，返回结果
      if (result.length) {
        return result;
      }
    }
  }
  // 如果没有找到目标值，返回空数组
  return [];
};
