import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import { getPathLevel } from "../utils";

class ValidatorBoundaries extends Validator<ValidatorTypes.BOUNDARIES> {
  validate: Validator<ValidatorTypes.BOUNDARIES>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const level = getPathLevel(path);

    let values: Array<unknown> = list.map(i => i.get(path, "validation"));

    if (level) {
      values = values.flat(level);
    }

    values = values.filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const { min, max } = this.options;

    return !values.some(v => {
      const num = parseFloat(v as string);

      return num < min || num > max;
    });
  };
}

export default ValidatorBoundaries;
