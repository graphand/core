import Model from "./Model";
import { defineFieldsProperties } from "./utils";

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
