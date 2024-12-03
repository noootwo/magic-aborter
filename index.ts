import mitt from "mitt";

/**
 * Represents an object that can be aborted.
 * Any object that implements this interface must provide an abort method.
 *
 * @template T - The type of the object being made abortable
 */
export type Abortable<T = object> = T & {
  /**
   * Aborts the operation.
   */
  abort: () => any;
};

/**
 * Configuration options for creating a new MagicAborter instance.
 */
export interface AborterOptions {
  /** Optional array of child aborters that will be aborted when the parent is aborted */
  children?: Array<MagicAborter>;
}

/** Event types that can be emitted by MagicAborter */
export type EventType = "abort" | "aborted";

/**
 * MagicAborter is a utility class that manages multiple abortable operations.
 * It can collect various types of abortable objects (like Promises, fetch requests, or native AbortControllers)
 * and abort them all at once.
 *
 * Features:
 * - Collect multiple abortable objects
 * - Create parent-child relationships between aborters
 * - Event-driven architecture with abort events
 * - TypeScript support
 *
 * @implements {Abortable}
 */
export class MagicAborter implements Abortable {
  private _aborted: boolean = false;
  private children: Array<MagicAborter> = [];
  private collections: Array<Abortable> = [];
  private emitter = mitt();

  /**
   * Converts any object into an abortable object by adding an abort method.
   *
   * @template T - The type of object to make abortable
   * @param {T} target - The object to make abortable
   * @param {() => void} abort - The abort function to be called
   * @returns {Abortable<T>} The original object with an abort method
   */
  static toAbortable<T>(target: T, abort: () => void): Abortable<T> {
    (target as Abortable).abort = abort;
    return target as Abortable<T>;
  }

  /**
   * Creates a new MagicAborter instance.
   *
   * @param {AborterOptions} [options] - Configuration options
   * @param {Array<MagicAborter>} [options.children] - Child aborters to be managed
   */
  constructor(options?: AborterOptions) {
    const { children = [] } = options || {};
    this.children = children;
  }

  /**
   * Gets the current abort state.
   * Returns true only if this aborter and all its children are aborted.
   */
  get aborted() {
    return this._aborted && this.children.every((i) => i.aborted);
  }

  /**
   * Sets the abort state of this aborter.
   */
  set aborted(value: boolean) {
    this._aborted = value;
  }

  /**
   * Collects an abortable object to be managed by this aborter.
   * The object must implement the Abortable interface (have an abort method).
   *
   * @param {Abortable} abortable - The abortable object to collect
   */
  collect(abortable: Abortable) {
    if (!this.collections.includes(abortable)) this.collections.push(abortable);
    this.aborted = false;
  }

  /**
   * Aborts all collected operations and child aborters.
   * This will:
   * 1. Emit the 'abort' event
   * 2. Abort all collected operations
   * 3. Abort all child aborters
   * 4. Set the aborted state to true
   * 5. Emit the 'aborted' event
   */
  abort() {
    if (this.aborted) return;

    this.emitter.emit("abort");

    while (this.collections.length) {
      this.collections.shift()!.abort();
    }

    this.children.forEach((i) => i.abort());

    this.aborted = true;
    this.emitter.emit("aborted");
  }

  /**
   * Registers an event listener for the specified event type.
   *
   * @param {EventType} event - The event type to listen for ('abort' or 'aborted')
   * @param {() => void} listener - The callback function to execute when the event occurs
   */
  on(event: EventType, listener: () => void) {
    this.emitter.on(event, listener);
  }

  /**
   * Removes an event listener for the specified event type.
   *
   * @param {EventType} event - The event type to remove the listener from
   * @param {() => void} listener - The callback function to remove
   */
  off(event: EventType, listener: () => void) {
    this.emitter.off(event, listener);
  }

  /**
   * Registers a listener for the 'abort' event.
   * This event is emitted before the abort operation begins.
   *
   * @param {() => void} listener - The callback function to execute
   */
  onAbort(listener: () => void) {
    this.on("abort", listener);
  }

  /**
   * Registers a listener for the 'aborted' event.
   * This event is emitted after all operations have been aborted.
   *
   * @param {() => void} listener - The callback function to execute
   */
  onAborted(listener: () => void) {
    this.on("aborted", listener);
  }

  /**
   * Adds a child aborter to this aborter.
   * When this aborter is aborted, all child aborters will also be aborted.
   *
   * @param {MagicAborter} child - The child aborter to add
   */
  addChildAborter(child: MagicAborter) {
    this.children.push(child);
  }

  /**
   * Removes a child aborter from this aborter.
   *
   * @param {MagicAborter} child - The child aborter to remove
   */
  removeChildAborter(child: MagicAborter) {
    this.children.splice(this.children.indexOf(child), 1);
  }
}

/**
 * Creates a new MagicAborter instance with the specified options.
 * This is a convenience function for creating a new aborter.
 *
 * @param {AborterOptions} [options] - Configuration options for the aborter
 * @returns {MagicAborter} A new MagicAborter instance
 */
export function createMagicAborter(options?: AborterOptions): MagicAborter {
  return new MagicAborter(options);
}

/**
 * A convenience export of the static toAbortable method.
 * Converts any object into an abortable object.
 *
 * @template T - The type of object to make abortable
 * @param {T} target - The object to make abortable
 * @param {() => void} abort - The abort function to be called
 * @returns {Abortable<T>} The original object with an abort method
 */
export const toAbortable = MagicAborter.toAbortable;
