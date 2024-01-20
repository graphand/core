import Model from "./Model";
/**
 * A decorator that extends the model class with the defineFieldsProperties function in the constructor
 * @returns a decorator that extends the model class with the defineFieldsProperties function
 */
export declare const modelDecorator: () => <T extends typeof Model>(model: T) => T;
