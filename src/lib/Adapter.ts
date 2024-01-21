import { AdapterFetcher } from "@/types";
import Model from "@/lib/Model";
import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";
import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import CoreError from "./CoreError";

class Adapter {
  static _modelsRegistry: Map<string, typeof Model>;

  fetcher: AdapterFetcher; // The adapter configuration = how the adapter should process
  fieldsMap: { [T in FieldTypes]?: typeof Field<T> }; // The fields map of the current adapter instance to use
  validatorsMap: { [T in ValidatorTypes]?: typeof Validator<T> }; // The validators map of the current adapter instance to use
  model: typeof Model; // The model of the current adapter instance
  runValidators: boolean; // If the adapter should run validators after a model create/update

  constructor(model: typeof Model) {
    this.model = model;
  }

  static hasModel(slug: string) {
    return Boolean(this._modelsRegistry?.has(slug));
  }

  static getModel(slug: string) {
    return this._modelsRegistry?.get(slug);
  }

  static registerModel(model: typeof Model, force = false) {
    if (!model.cacheAdapter) {
      return;
    }

    if (!force && this.hasModel(model.slug)) {
      throw new CoreError({
        message: `Model ${model.slug} already registered`,
      });
    }

    this._modelsRegistry ??= new Map();
    this._modelsRegistry.set(model.slug, model);
  }

  static clearModels() {
    this._modelsRegistry?.clear();
  }

  /**
   * Get the base adapter class to extend from.
   */
  get base() {
    return this.constructor as typeof Adapter;
  }
}

export default Adapter;
