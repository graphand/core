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

class DefaultValidatorUnique extends Validator<ValidatorTypes.UNIQUE> {
  async validate(data, ctx) {
    const values = data
      .map((i) => i[this.options.field])
      .filter((v) => v !== undefined);

    if (!values.length) return true;

    const hasTwice = values.some(
      (v, i) => values.indexOf(v) !== i || values.lastIndexOf(v) !== i
    );
    if (hasTwice) {
      return false;
    }

    const fieldsPath = ctx.fieldsJSONPath?.map((f) => f.slug) || [];
    const path = fieldsPath.concat(this.options.field).join(".");
    const model = ctx.model;

    const found = await Promise.all(
      values.map(async (value) => {
        const found = await model.count({ filter: { [path]: value } });
        return [value, found];
      })
    );

    return found.every(([value, count]) => count < 2);
  }
}

const defaultValidatorsMap: Adapter["validatorsMap"] = {
  [ValidatorTypes.REQUIRED]: DefaultValidatorRequired,
  [ValidatorTypes.UNIQUE]: DefaultValidatorUnique,
};

export default defaultValidatorsMap;
