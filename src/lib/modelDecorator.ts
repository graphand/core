import Model from "./Model";

export const modelDecorator = () => {
  return <T extends typeof Model>(model: T): T => {
    // @ts-ignore
    return class extends model {
      constructor(props) {
        super(props);

        this.defineFieldsProperties();
      }
    };
  };
};
