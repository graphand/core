class Thenable<T extends any> {
  __params: ConstructorParameters<typeof Promise<T>>;
  __promise: Promise<T> | null = null;

  constructor(params: ConstructorParameters<typeof Promise<T>>) {
    this.__params = Array.isArray(params) ? params : [params];

    Object.defineProperty(this, "__params", { enumerable: false });
    Object.defineProperty(this, "__promise", { enumerable: false });
  }

  get promise() {
    this.__promise ??= new Promise<T>(...this.__params);
    return this.__promise;
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch<TResult = never>(
    onRejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<T | TResult> {
    return this.promise.catch(onRejected);
  }

  finally(onFinally?: (() => void) | undefined | null): Promise<T> {
    return this.promise.finally(onFinally);
  }
}

export default Thenable;
