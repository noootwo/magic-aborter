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
# 或
pnpm add magic-aborter
```

## 使用方法

### 创建中止器

创建一个新的 MagicAborter 实例来管理可中止的操作。

```typescript
// 创建新的中止器
const aborter = createMagicAborter();
```

### 创建可中止的 Promise

使用 `toAbortable` 工具将普通的 promise 转换为可中止的 promise。

```typescript
// 创建可中止的 promise
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const abortableDelay = toAbortable(delay(5000), () => {
  console.log("定时器已中止！");
  // 在这里进行清理工作（例如，清除定时器）
});
```

### 配合 Fetch API 使用

使用 AbortController 集成原生的 fetch API。

```typescript
// 使用原生 AbortController 进行 fetch
const controller = new AbortController();
const fetchData = fetch("https://api.example.com/data", {
  signal: controller.signal,
});
// 直接收集 controller，因为它已经有 abort() 方法
aborter.collect(controller);
```

### 自定义可中止操作

创建一个使用 AbortSignal 的自定义可中止操作。

```typescript
// 另一个原生 AbortController 示例
const anotherController = new AbortController();
const customOperation = (signal: AbortSignal) => {
  return new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => {
      reject(new Error("操作已中止"));
    });
    // 这里是你的异步操作
  });
};
// 启动操作并收集其 controller
customOperation(anotherController.signal);
aborter.collect(anotherController);
```

### 收集操作

将可中止的操作添加到你的 MagicAborter 实例中。

```typescript
// 收集操作
aborter.collect(abortableDelay);
```

### 事件处理

监听中止事件以在中止前后执行操作。

```typescript
// 监听中止事件
aborter.onAbort(() => {
  console.log("正在中止所有操作...");
});

aborter.onAborted(() => {
  console.log("所有操作已中止！");
});
```

### 触发中止

通过一次调用中止所有已收集的操作。调用 `abort()` 后，所有已收集的可中止对象将被自动清空，这样你就可以重复使用同一个中止器来处理新的操作。

```typescript
// 触发中止 - 将中止所有已收集的操作
aborter.abort();

// 在 abort() 之后，中止器被清空并可以用于新的操作
aborter.collect(newAbortableOperation); // 你可以收集新的操作
```

### 层级中止控制

创建中止器之间的父子关系以实现层级控制。

```typescript
const parentAborter = createMagicAborter();
const childAborter = createMagicAborter();

parentAborter.addChildAborter(childAborter);

// 当父级中止时，子级也会中止
parentAborter.abort();
```

## API

### `MagicAborter`

用于管理可中止操作的主类。

#### 方法

- `abort(): void`

  - 中止所有已收集的操作和子中止器
  - 中止后自动清空所有已收集的操作
  - 在开始前触发 'abort' 事件，完成后触发 'aborted' 事件

- `collect(abortable: Abortable): void`

  - 收集一个可中止的操作
  - 参数：
    - `abortable`: 任何实现了 `Abortable` 接口的对象（必须有 `abort()` 方法）

- `onAbort(listener: () => void): void`

  - 注册中止前事件的监听器
  - 参数：
    - `listener`: 在中止操作开始前执行的回调函数

- `onAborted(listener: () => void): void`

  - 注册中止后事件的监听器
  - 参数：
    - `listener`: 在所有操作中止后执行的回调函数

- `addChildAborter(child: MagicAborter): void`

  - 添加子中止器到当前实例
  - 参数：
    - `child`: 要作为子级管理的另一个 MagicAborter 实例

- `removeChildAborter(child: MagicAborter): void`
  - 从当前实例移除子中止器
  - 参数：
    - `child`: 要移除的子 MagicAborter 实例

#### 属性

- `aborted: boolean`
  - 只读属性，表示此中止器及其所有子级是否已中止
  - 仅当此中止器和所有子级都已中止时返回 `true`

### `createMagicAborter(options?)`

创建一个新的 MagicAborter 实例。

#### 参数

- `options?: AborterOptions`
  - 可选的配置对象，包含以下属性：
    - `children?: MagicAborter[]`: 要管理的子中止器数组

#### 返回值

- `MagicAborter`: 一个新的 MagicAborter 实例

### `toAbortable<T>(target, abortFn)`

将任意对象转换为可中止对象。

#### 类型参数

- `T`: 目标对象的类型

#### 参数

- `target: T`: 要转换为可中止的对象
- `abortFn: () => void`: 对象被中止时要调用的函数

#### 返回值

- `Abortable<T>`: 添加了 `abort()` 方法的原始对象

### 类型定义

#### `Abortable<T>`

可中止对象的接口。

```typescript
type Abortable<T = object> = T & {
  abort: () => any;
};
```

#### `AborterOptions`

创建新的 MagicAborter 的配置选项。

```typescript
interface AborterOptions {
  children?: Array<MagicAborter>;
}
```

## 许可证

MIT
