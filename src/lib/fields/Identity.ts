import FieldTypes from "@/enums/field-types";
import IdentityTypes from "@/enums/identity-types";
import SerializerFormat from "@/enums/serializer-format";
import Field from "@/lib/Field";
import { isObjectId } from "@/lib/utils";

class FieldIdentity extends Field<FieldTypes.IDENTITY> {
  validate: Field<FieldTypes.IDENTITY>["validate"] = async ({ list }) => {
    const _isInvalid = value => {
      if (value === null || value === undefined) {
        return false;
      }

      const [type, id] = String(value).split(":");

      return !Object.values(IdentityTypes).includes(type as IdentityTypes) || !isObjectId(id);
    };

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);

    return !values.some(_isInvalid);
  };

  sTo: Field<FieldTypes.IDENTITY>["sTo"] = ({ value }) => String(value);
}

export default FieldIdentity;
