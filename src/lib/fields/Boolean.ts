import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldBoolean extends Field<FieldTypes.BOOLEAN> {
  sTo: Field<FieldTypes.BOOLEAN>["sTo"] = ({ value }) => Boolean(value);
}

export default FieldBoolean;
