import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";

class ValidatorBoundaries extends Validator<ValidatorTypes.BOUNDARIES> {
  validate: Validator<ValidatorTypes.BOUNDARIES>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const values = list
      .map(i => i.get(path))
      .flat(Infinity)
      .filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const { min, max } = this.options;

    return !values.some(v => {
      const num = parseFloat(v);

      return num < min || num > max;
    });
  };
}

export default ValidatorBoundaries;
