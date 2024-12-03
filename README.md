# Magic Aborter

English | [简体中文](./README_zh.md)

A utility for managing multiple abortable operations in TypeScript/JavaScript applications. It allows you to:
- Collect multiple abortable objects (like fetch requests, timers, or any custom abortable operations)
- Create parent-child relationships between aborters
- Abort all collected operations and child aborters with a single call

## Features

- **One-Click Abort**: Abort multiple operations with a single `abort()` call
- **Parent-Child Structure**: Create hierarchical abort relationships - when parent aborts, all children abort
- **Operation Collection**: Collect any number of abortable operations (like fetch requests or timers)
- **Event Handling**: Get notified before and after abort operations through event listeners
- **TypeScript support out of the box**

## Installation

```bash
npm install magic-aborter
# or
yarn add magic-aborter
```

## Usage

```typescript
import { createMagicAborter, toAbortable } from 'magic-aborter';

// Create a new aborter
const aborter = createMagicAborter();

// Create an abortable promise
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const abortableDelay = toAbortable(delay(5000), () => {
  console.log('Timer aborted!');
  // Clean up logic here (e.g., clear timeout)
});

// Use native AbortController for fetch
const controller = new AbortController();
const fetchData = fetch('https://api.example.com/data', { 
  signal: controller.signal 
});
// Directly collect the controller since it already has abort() method
aborter.collect(controller);

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

// Collect operations
aborter.collect(abortableDelay);

// Listen to abort events
aborter.onAbort(() => {
  console.log('Aborting all operations...');
});

aborter.onAborted(() => {
  console.log('All operations aborted!');
});

// Trigger abort - will abort all collected operations
aborter.abort();
```

### Hierarchical Abort Control

```typescript
const parentAborter = createMagicAborter();
const childAborter = createMagicAborter();

parentAborter.addChildAborter(childAborter);

// When parent aborts, child will also abort
parentAborter.abort();
```

## API

### `MagicAborter`

- `abort()`: Triggers the abort operation
- `collect(abortable)`: Collects an abortable operation
- `onAbort(listener)`: Registers a listener for the abort event
- `onAborted(listener)`: Registers a listener for the aborted event
- `addChildAborter(child)`: Adds a child aborter
- `removeChildAborter(child)`: Removes a child aborter

### `createMagicAborter(options?)`

Creates a new MagicAborter instance with optional configuration.

### `toAbortable<T>(target, abortFn)`

Converts any object into an abortable object.

## License

MIT
