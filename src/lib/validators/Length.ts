import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import { getPathLevel } from "../utils";

class ValidatorLength extends Validator<ValidatorTypes.LENGTH> {
  validate: Validator<ValidatorTypes.LENGTH>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const level = getPathLevel(path);

    let values: Array<unknown> = list.map(i => i.get(path));

    if (level) {
      values = values.flat(level);
    }

    values = values.filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const { min, max } = this.options;

    return !values.some(v => {
      let length = (v as string)?.length ?? 0;

      if (typeof v === "number") {
        length = String(v).length;
      }

      return length < min || length > max;
    });
  };
}

export default ValidatorLength;
