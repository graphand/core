import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import { getPathLevel } from "../utils";

class ValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
  validate: Validator<ValidatorTypes.REQUIRED>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const level = getPathLevel(path);

    let values: Array<unknown> = list.map(i => i.get(path));

    if (level) {
      values = values.flat(level);
    }

    if (!values?.length) return true;

    return !values.some(v => [null, undefined, ""].includes(v as string));
  };
}

export default ValidatorRequired;
