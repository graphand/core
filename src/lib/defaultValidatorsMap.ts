import Adapter from "./Adapter";
import Validator from "./Validator";
import ValidatorTypes from "../enums/validator-types";

class DefaultValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
  async validate(data) {
    const invalid = data.find((i) =>
      [null, undefined, ""].includes(i[this.options.field])
    );

    return !invalid;
  }
}

const defaultValidatorsMap: Adapter["validatorsMap"] = {
  [ValidatorTypes.REQUIRED]: DefaultValidatorRequired,
};

export default defaultValidatorsMap;
