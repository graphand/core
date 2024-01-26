import ValidatorTypes from "@/enums/validator-types";
import {
  ModelInstance,
  TransactionCtx,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
} from "@/types";
import Model from "@/lib/Model";
import { getDefaultValidatorOptions } from "@/lib/utils";

class Validator<T extends ValidatorTypes = ValidatorTypes> {
  #definition: ValidatorDefinition<T>;
  #path: undefined | string;

  hooks: Array<ValidatorHook>;

  constructor(definition: ValidatorDefinition<T>, path?: string) {
    this.#definition = definition;
    this.#path = path;
  }

  get type(): T {
    return this.#definition.type as T;
  }

  get path() {
    return this.#path;
  }

  get options(): ValidatorOptions<T> {
    const defaults = getDefaultValidatorOptions(this.type);

    return Object.assign({}, defaults, this.#definition.options ?? {}) as ValidatorOptions<T>;
  }

  getFullPath() {
    return [this.#path, this.options.field].filter(Boolean).join(".");
  }

  getKey() {
    return this.getFullPath() + this.type;
  }

  validate?: (input: {
    list: Array<ModelInstance>;
    model: typeof Model;
    ctx?: TransactionCtx;
  }) => Promise<boolean>;

  toJSON() {
    return {
      type: this.type,
      options: this.options,
      path: this.#path,
    };
  }
}

export default Validator;
