import Model from "./Model";

export const modelDecorator = () => {
  return <T extends typeof Model>(model: T): T => {
    // @ts-ignore
    return class extends model {
      constructor(doc) {
        super(doc);

        const _this = this as InstanceType<T>;
        _this.defineFieldsProperties();
      }
    };
  };
};
