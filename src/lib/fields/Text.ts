import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";
import { isObjectId } from "@/lib/utils";

class FieldText extends Field<FieldTypes.TEXT> {
  validate: Field<FieldTypes.TEXT>["validate"] = async ({ list }) => {
    const _isInvalid = value => {
      if (value === null || value === undefined) {
        return false;
      }

      if (this.options.options?.length && this.options.strict) {
        return !this.options.options.includes(String(value));
      }

      if (isObjectId(value)) {
        return true;
      }

      return false;
    };

    const values = list.map(i => i.get(this.path, "validation")).flat(Infinity);

    return !values.some(_isInvalid);
  };

  sTo: Field<FieldTypes.TEXT>["sTo"] = ({ value, format }) => {
    const res = Array.isArray(value) ? String(value[0]) : String(value);

    if (
      this.options.options?.length &&
      this.options.strict &&
      !this.options.options.includes(res) &&
      format !== "validation"
    ) {
      return undefined;
    }

    return res;
  };
}

export default FieldText;
