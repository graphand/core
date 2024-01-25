import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";

class ValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
  validate: Validator<ValidatorTypes.REQUIRED>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const values = list.map(i => i.get(path)).flat(Infinity);

    if (!values?.length) return true;

    return !values.some(v => [null, undefined, ""].includes(v));
  };
}

export default ValidatorRequired;
