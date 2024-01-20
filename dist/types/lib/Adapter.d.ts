import { AdapterFetcher } from "../types";
import Model from "./Model";
import FieldTypes from "../enums/field-types";
import Field from "./Field";
import ValidatorTypes from "../enums/validator-types";
import Validator from "./Validator";
declare class Adapter {
    static _modelsMap: Map<string, typeof Model>;
    fetcher: AdapterFetcher;
    fieldsMap: {
        [T in FieldTypes]?: typeof Field<T>;
    };
    validatorsMap: {
        [T in ValidatorTypes]?: typeof Validator<T>;
    };
    model: typeof Model;
    runValidators: boolean;
    constructor(model: typeof Model);
    static get modelsMap(): Map<string, typeof Model>;
    /**
     * Get the base adapter class to extend from.
     */
    get base(): typeof Adapter;
}
export default Adapter;
