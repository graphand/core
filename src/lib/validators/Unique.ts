import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";

class ValidatorUnique extends Validator<ValidatorTypes.UNIQUE> {
  validate: Validator<ValidatorTypes.UNIQUE>["validate"] = async ({ list }) => {
    const path = this.getFullPath();
    const values = list
      .map(i => i.get(path))
      .flat(Infinity)
      .filter(v => ![null, undefined, ""].includes(v as string));

    if (!values?.length) {
      return true;
    }

    const valueSet = new Set();
    const hasTwice = values.some(v => {
      if (valueSet.has(v)) {
        return true;
      }

      valueSet.add(v);
      return false;
    });

    if (hasTwice) {
      return false;
    }

    return true;
  };
}

export default ValidatorUnique;
