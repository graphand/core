import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";

class ValidatorRegex extends Validator<ValidatorTypes.REGEX> {
  validate: Validator<ValidatorTypes.REGEX>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const values = list
      .map(i => i.get(path))
      .flat(Infinity)
      .filter(v => ![null, undefined, ""].includes(v));

    if (!values?.length) return true;

    const regex = new RegExp(this.options.pattern, this.options.options?.join(""));

    return !values.some(v => !regex.test(v));
  };
}

export default ValidatorRegex;
