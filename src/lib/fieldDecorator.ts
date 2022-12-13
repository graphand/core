import FieldTypes from "../enums/field-types";
import Model from "./Model";
import Field, { FieldOptions } from "./Field";
import FieldId from "./fields/FieldId";
import FieldText from "./fields/FieldText";
import FieldJSON from "./fields/FieldJSON";
import FieldRelation from "./fields/FieldRelation";
import FieldDate from "./fields/FieldDate";
import FieldNumber from "./fields/FieldNumber";

export const fieldDecorator = <T extends string | FieldTypes>(
  type: T,
  options?: FieldOptions<T>
) => {
  return <T extends Model>(target: T, key: keyof T) => {
    if (!target.model.hasOwnProperty("__fields") || !target.model.__fields) {
      target.model.__fields = new Map<string, Field>();
    }

    let _FieldModel;

    switch (type) {
      case "Id":
        _FieldModel = FieldId;
        break;
      case "Text":
        _FieldModel = FieldText;
        break;
      case "JSON":
        _FieldModel = FieldJSON;
        break;
      case "Relation":
        _FieldModel = FieldRelation;
        break;
      case "Date":
        _FieldModel = FieldDate;
        break;
      case "Number":
        _FieldModel = FieldNumber;
        break;
    }

    target.model.__fields.set(String(key), new _FieldModel(options));
  };
};
