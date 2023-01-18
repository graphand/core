import ValidatorTypes from "../enums/validator-types";
import {
  FieldOptions,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
} from "../types";
import Model from "./Model";

class Validator<
  T extends ValidatorTypes = ValidatorTypes,
  M extends typeof Model = typeof Model
> {
  private __definition: ValidatorDefinition<T>;

  hooks: Array<ValidatorHook>;

  constructor(definition: ValidatorDefinition<T>) {
    this.__definition = definition;
  }

  get type(): T {
    return this.__definition.type;
  }

  get options(): ValidatorOptions<T> {
    return this.__definition.options ?? ({} as ValidatorOptions<T>);
  }

  async validate(ids: string[], model: M, ctx: any) {
    return true;
  }
}

export default Validator;
