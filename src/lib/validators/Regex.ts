import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import { getPathLevel } from "../utils";

class ValidatorRegex extends Validator<ValidatorTypes.REGEX> {
  validate: Validator<ValidatorTypes.REGEX>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const level = getPathLevel(path);

    let values: Array<unknown> = list.map(i => i.get(path));

    if (level) {
      values = values.flat(level);
    }

    values = values.filter(v => ![null, undefined, ""].includes(v as string));

    if (!values?.length) return true;

    const regex = new RegExp(this.options.pattern, this.options.options?.join(""));

    return !values.some(v => !regex.test(v as string));
  };
}

export default ValidatorRegex;
