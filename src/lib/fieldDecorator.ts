import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldDefinition, FieldOptions } from "../types";

export const fieldDecorator = <T extends FieldTypes>(
  type: T,
  options?: FieldOptions<T>
) => {
  return <M extends Model>(target: M, key: keyof M) => {
    if (!target.model.hasOwnProperty("fields") || !target.model.fields) {
      target.model.fields = {};
    }

    target.model.fields[String(key)] = { type, options } as FieldDefinition<T>;
  };
};
