import ValidatorTypes from "../enums/validator-types";
import { ValidatorOptions } from "../types";
import Model from "./Model";

class Validator<T extends ValidatorTypes = ValidatorTypes> {
  private __options: ValidatorOptions<T>;

  constructor(options: ValidatorOptions<T> = {} as any) {
    this.__options = options;
  }

  get options() {
    return this.__options;
  }

  async validate(ids: string[], from: Model) {
    return true;
  }
}

export default Validator;
