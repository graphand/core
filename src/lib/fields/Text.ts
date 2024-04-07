import FieldTypes from "@/enums/field-types";
import { FieldSerializerInput } from "@/index";
import Field from "@/lib/Field";
import { isObjectId } from "@/lib/utils";

class FieldText extends Field<FieldTypes.TEXT> {
  validate: Field<FieldTypes.TEXT>["validate"] = async ({ list }) => {
    const _isInvalid = value => {
      if (value === null || value === undefined) {
        return false;
      }

      if (this.options.enum?.length && this.options.strict) {
        return !this.options.enum.includes(String(value));
      }

      if (isObjectId(value)) {
        return true;
      }

      return false;
    };

    const values = list.map(i => i.get(this.path, "validation")).flat(Infinity);

    return !values.some(_isInvalid);
  };

  _sDefault = ({ value }: FieldSerializerInput) => {
    const single = Array.isArray(value) ? String(value[0]) : String(value);

    if (this.options.enum?.length && this.options.strict) {
      return this.options.enum.includes(single) ? single : undefined;
    }

    return single;
  };

  serializerMap: Field<FieldTypes.TEXT>["serializerMap"] = {
    validation: ({ value }) => value,
    [Field.defaultSymbol]: this._sDefault,
  };
}

export default FieldText;
