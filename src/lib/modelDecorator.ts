import Model from "./Model";

export const modelDecorator = () => {
  return <T extends typeof Model>(model: T): T => {
    // @ts-ignore
    return class extends model {
      constructor(doc) {
        super(doc);

        this.defineFieldsProperties();
      }
    };
  };
};
