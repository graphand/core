import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

const toDate = value => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

class FieldDate extends Field<FieldTypes.DATE> {
  serializerMap: Field<FieldTypes.DATE>["serializerMap"] = {
    json: ({ value }) => {
      const date = toDate(value);
      return date ? date.toJSON() : null;
    },
    [Field.defaultSymbol]: ({ value }) => toDate(value),
  };
}

export default FieldDate;
