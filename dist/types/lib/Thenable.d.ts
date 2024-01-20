/**
 * This class is a wrapper for the native Promise class.
 * It allows to create a promise and resolve it later.
 */
declare class Thenable<T = any> {
    #private;
    constructor(params: ConstructorParameters<typeof Promise<T>>);
    get promise(): Promise<T>;
    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    finally(onFinally?: (() => void) | undefined | null): Promise<T>;
}
export default Thenable;
