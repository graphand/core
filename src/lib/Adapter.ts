import { AdapterFetcher } from "../types";
import Model from "./Model";
import FieldTypes from "../enums/field-types";
import Field from "./Field";
import ValidatorTypes from "../enums/validator-types";
import Validator from "./Validator";

class Adapter {
  static __modelsMap: Map<string, typeof Model>;

  fetcher: AdapterFetcher; // The adapter configuration = how the adapter should process
  fieldsMap: { [T in FieldTypes]?: typeof Field<T> }; // The fields map of the current adapter instance to use
  validatorsMap: { [T in ValidatorTypes]?: typeof Validator<T> }; // The validators map of the current adapter instance to use
  model: typeof Model; // The model of the current adapter instance
  runValidators: boolean; // If the adapter should run validators after a model create/update

  constructor(model: typeof Model) {
    this.model = model;
  }

  /**
   * Get the base adapter class to extend from.
   */
  get base() {
    return this.constructor as typeof Adapter;
  }
}

export default Adapter;
