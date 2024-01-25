import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";

class ValidatorLength extends Validator<ValidatorTypes.LENGTH> {
  validate: Validator<ValidatorTypes.LENGTH>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const values = list
      .map(i => i.get(path))
      .flat(Infinity)
      .filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const { min, max } = this.options;

    return !values.some(v => {
      let length = v?.length ?? 0;

      if (typeof v === "number") {
        length = String(v).length;
      }

      return length < min || length > max;
    });
  };
}

export default ValidatorLength;
