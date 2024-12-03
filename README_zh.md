# Magic Aborter

[English](./README.md) | 简体中文

一个用于管理多个可中止操作的 TypeScript/JavaScript 工具。它可以帮助你：
- 收集多个可中止对象（如 fetch 请求、定时器或任何自定义的可中止操作）
- 创建 aborter 之间的父子关系
- 通过一次调用中止所有已收集的操作和子 aborter

## 特性

- 🎯 **一键中止**：通过一次 `abort()` 调用中止多个操作
- 🌲 **父子结构**：创建层级化的中止关系 - 当父级中止时，所有子级都会中止
- 🔄 **操作收集**：收集任意数量的可中止操作（如 fetch 请求或定时器）
- 🎭 **事件处理**：通过事件监听器在中止操作前后获得通知
- 📦 内置 TypeScript 支持

## 安装

```bash
npm install magic-aborter
# 或
yarn add magic-aborter
```

## 使用方法

```typescript
import { createMagicAborter, toAbortable } from 'magic-aborter';

// 创建新的中止器
const aborter = createMagicAborter();

// 创建可中止的 Promise
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const abortableDelay = toAbortable(delay(5000), () => {
  console.log('定时器已中止！');
  // 这里可以添加清理逻辑（如清除定时器）
});

// 使用原生 AbortController 处理 fetch 请求
const controller = new AbortController();
const fetchData = fetch('https://api.example.com/data', { 
  signal: controller.signal 
});
// 直接收集 controller，因为它已经有 abort() 方法
aborter.collect(controller);

// 另一个原生 AbortController 示例
const anotherController = new AbortController();
const customOperation = (signal: AbortSignal) => {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => {
      reject(new Error('操作已中止'));
    });
    // 这里是你的异步操作
  });
};
// 启动操作并收集其控制器
customOperation(anotherController.signal);
aborter.collect(anotherController);

// 收集操作
aborter.collect(abortableDelay);

// 监听中止事件
aborter.onAbort(() => {
  console.log('正在中止所有操作...');
});

aborter.onAborted(() => {
  console.log('所有操作已中止！');
});

// 触发中止 - 将中止所有已收集的操作
aborter.abort();
```

### 层级化中止控制

```typescript
const parentAborter = createMagicAborter();
const childAborter = createMagicAborter();

parentAborter.addChildAborter(childAborter);

// 当父级中止时，子级也会中止
parentAborter.abort();
```

## API

### `MagicAborter`

- `abort()`: 触发中止操作
- `collect(abortable)`: 收集可中止操作
- `onAbort(listener)`: 注册中止事件监听器
- `onAborted(listener)`: 注册已中止事件监听器
- `addChildAborter(child)`: 添加子中止器
- `removeChildAborter(child)`: 移除子中止器

### `createMagicAborter(options?)`

创建一个新的 MagicAborter 实例，可选配置参数。

### `toAbortable<T>(target, abortFn)`

将任意对象转换为可中止对象。

## 许可证

MIT
