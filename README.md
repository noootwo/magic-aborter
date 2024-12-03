# Magic Aborter

English | [简体中文](./README_zh.md)

A utility for managing multiple abortable operations in TypeScript/JavaScript applications. It allows you to:
- Collect multiple abortable objects (like fetch requests, timers, or any custom abortable operations)
- Create parent-child relationships between aborters
- Abort all collected operations and child aborters with a single call

## Features

- 🎯 **One-Click Abort**: Abort multiple operations with a single `abort()` call
- 🌲 **Parent-Child Structure**: Create hierarchical abort relationships - when parent aborts, all children abort
- 🔄 **Operation Collection**: Collect any number of abortable operations (like fetch requests or timers)
- 🎭 **Event Handling**: Get notified before and after abort operations through event listeners
- 📦 **TypeScript support out of the box**

## Installation

```bash
npm install magic-aborter
# or
yarn add magic-aborter
# or
pnpm add magic-aborter
```

## Usage

### Create an Aborter
Create a new instance of MagicAborter to manage your abortable operations.

```typescript
// Create a new aborter
const aborter = createMagicAborter();
```

### Create Abortable Promise
Transform a regular promise into an abortable one using the `toAbortable` utility.

```typescript
// Create an abortable promise
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const abortableDelay = toAbortable(delay(5000), () => {
  console.log('Timer aborted!');
  // Clean up logic here (e.g., clear timeout)
});
```

### Use with Fetch API
Integrate with native fetch API using AbortController.

```typescript
// Use native AbortController for fetch
const controller = new AbortController();
const fetchData = fetch('https://api.example.com/data', { 
  signal: controller.signal 
});
// Directly collect the controller since it already has abort() method
aborter.collect(controller);
```

### Custom Abortable Operation
Create a custom operation that can be aborted using AbortSignal.

```typescript
// Another native AbortController example
const anotherController = new AbortController();
const customOperation = (signal: AbortSignal) => {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => {
      reject(new Error('Operation aborted'));
    });
    // Your async operation here
  });
};
// Start the operation and collect its controller
customOperation(anotherController.signal);
aborter.collect(anotherController);
```

### Collect Operations
Add abortable operations to your MagicAborter instance.

```typescript
// Collect operations
aborter.collect(abortableDelay);
```

### Event Handling
Listen to abort events to perform actions before and after abortion.

```typescript
// Listen to abort events
aborter.onAbort(() => {
  console.log('Aborting all operations...');
});

aborter.onAborted(() => {
  console.log('All operations aborted!');
});
```

### Trigger Abort
Abort all collected operations with a single call. After `abort()` is called, all collected abortables will be cleared automatically, allowing you to reuse the same aborter for new operations.

```typescript
// Trigger abort - will abort all collected operations
aborter.abort();

// After abort(), the aborter is cleared and ready for new operations
aborter.collect(newAbortableOperation); // You can collect new operations
```

### Hierarchical Abort Control
Create parent-child relationships between aborters for hierarchical control.

```typescript
const parentAborter = createMagicAborter();
const childAborter = createMagicAborter();

parentAborter.addChildAborter(childAborter);

// When parent aborts, child will also abort
parentAborter.abort();
```

## API

### `MagicAborter`

The main class for managing abortable operations.

#### Methods

- `abort(): void`
  - Aborts all collected operations and child aborters
  - Clears all collected operations after aborting
  - Emits 'abort' event before starting and 'aborted' event after completion

- `collect(abortable: Abortable): void`
  - Collects an abortable operation
  - Parameters:
    - `abortable`: Any object implementing the `Abortable` interface (must have an `abort()` method)

- `onAbort(listener: () => void): void`
  - Registers a listener for the pre-abort event
  - Parameters:
    - `listener`: Callback function executed before abort operations begin

- `onAborted(listener: () => void): void`
  - Registers a listener for the post-abort event
  - Parameters:
    - `listener`: Callback function executed after all operations are aborted

- `addChildAborter(child: MagicAborter): void`
  - Adds a child aborter to the current instance
  - Parameters:
    - `child`: Another MagicAborter instance to be managed as a child

- `removeChildAborter(child: MagicAborter): void`
  - Removes a child aborter from the current instance
  - Parameters:
    - `child`: The child MagicAborter instance to remove

#### Properties

- `aborted: boolean`
  - Read-only property indicating whether this aborter and all its children are aborted
  - Returns `true` only if this aborter and all its children are aborted

### `createMagicAborter(options?)`

Creates a new MagicAborter instance.

#### Parameters

- `options?: AborterOptions`
  - Optional configuration object with the following properties:
    - `children?: MagicAborter[]`: Array of child aborters to be managed

#### Returns

- `MagicAborter`: A new MagicAborter instance

### `toAbortable<T>(target, abortFn)`

Converts any object into an abortable object.

#### Type Parameters

- `T`: The type of the target object

#### Parameters

- `target: T`: The object to make abortable
- `abortFn: () => void`: Function to be called when the object is aborted

#### Returns

- `Abortable<T>`: The original object enhanced with an `abort()` method

### Types

#### `Abortable<T>`

Interface for abortable objects.

```typescript
type Abortable<T = object> = T & {
  abort: () => any;
}
```

#### `AborterOptions`

Configuration options for creating a new MagicAborter.

```typescript
interface AborterOptions {
  children?: Array<MagicAborter>;
}
```

## License

MIT
