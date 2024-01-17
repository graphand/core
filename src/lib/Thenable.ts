/**
 * This class is a wrapper for the native Promise class.
 * It allows to create a promise and resolve it later.
 */
class Thenable<T = any> {
  #params: ConstructorParameters<typeof Promise<T>>;
  #promise: Promise<T> | null = null;

  constructor(params: ConstructorParameters<typeof Promise<T>>) {
    this.#params = Array.isArray(params) ? params : [params];
  }

  get promise() {
    this.#promise ??= new Promise<T>(...this.#params);
    return this.#promise;
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult> {
    return this.promise.catch(onRejected);
  }

  finally(onFinally?: (() => void) | undefined | null): Promise<T> {
    return this.promise.finally(onFinally);
  }
}

export default Thenable;
