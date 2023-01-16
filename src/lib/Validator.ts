import ValidatorTypes from "../enums/validator-types";
import { ValidatorDefinition, ValidatorOptions } from "../types";

class Validator<T extends ValidatorTypes = ValidatorTypes> {
  private __type: T;
  private __options: ValidatorOptions<T>;

  constructor(type: T, options: ValidatorOptions<T> = {} as any) {
    this.__type = type;
    this.__options = options;
  }

  static fromDefinition(def: ValidatorDefinition) {
    return new Validator(def.type, def.options);
  }

  get type() {
    return this.__type;
  }

  get options() {
    return this.__options;
  }
}

export default Validator;
