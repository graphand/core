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

  serializerMap: Field<FieldTypes.TEXT>["serializerMap"] = {
    [Field.defaultSymbol]: ({ value, format }) => {
      const single = Array.isArray(value) ? String(value[0]) : String(value);

      if (
        this.options.options?.length &&
        this.options.strict &&
        !this.options.options.includes(single) &&
        format !== "validation"
      ) {
        if (this.options.options.includes(String(value))) {
          return String(value);
        }

        return undefined;
      }

      return String(single);
    },
  };
}

export default FieldText;
