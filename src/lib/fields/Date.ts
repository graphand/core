import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldDate extends Field<FieldTypes.DATE> {
  _sToDate = value => {
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

  sJSON: Field<FieldTypes.DATE>["sJSON"] = ({ value }) => {
    const date = this._sToDate(value);
    return date ? date.toISOString() : null;
  };

  sTo: Field<FieldTypes.DATE>["sTo"] = ({ value }) => {
    return this._sToDate(value);
  };
}

export default FieldDate;
