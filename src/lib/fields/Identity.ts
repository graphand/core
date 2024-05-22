import FieldTypes from "@/enums/field-types";
import IdentityTypes from "@/enums/identity-types";
import Field from "@/lib/Field";
import { getPathLevel, isObjectId } from "@/lib/utils";
import FieldNested from "./Nested";

class FieldIdentity extends Field<FieldTypes.IDENTITY> {
  validate: Field<FieldTypes.IDENTITY>["validate"] = async ({ list }) => {
    const _isInvalid = value => {
      if (value === null || value === undefined) {
        return false;
      }

      const [type, id] = String(value).split(":");

      return !Object.values(IdentityTypes).includes(type as IdentityTypes) || !isObjectId(id);
    };
    const level = getPathLevel(this.path);

    let values: Array<unknown> = list.map(i => i.get(this.path, "validation"));

    if (level) {
      values = values.flat(level);
    }

    values = values.filter(v => v !== FieldNested.symbolIgnore);

    return !values.some(_isInvalid);
  };

  serializerMap: Field<FieldTypes.IDENTITY>["serializerMap"] = {
    validation: ({ value }) => value,
    [Field.defaultSymbol]: ({ value }) => String(value),
  };
}

export default FieldIdentity;
