import { AdapterFetcher } from "../types";
import Model from "./Model";
import FieldTypes from "../enums/field-types";
import Field from "./Field";
import ValidatorTypes from "../enums/validator-types";
import Validator from "./Validator";

class Adapter {
  fetcher: AdapterFetcher;
  fieldsMap: { [T in FieldTypes]?: typeof Field<T> };
  validatorsMap: { [T in ValidatorTypes]?: typeof Validator<T> };
  model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }
}

export default Adapter;
