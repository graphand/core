import Model from "./Model";
import { defineFieldsProperties } from "./utils";

/**
 * A decorator that extends the model class with the defineFieldsProperties function in the constructor
 * @returns a decorator that extends the model class with the defineFieldsProperties function
 */
export const modelDecorator = () => {
  return <T extends typeof Model>(model: T): T => {
    // @ts-ignore
    return class extends model {
      constructor(doc) {
        super(doc);

        defineFieldsProperties(this);
      }
    };
  };
};
