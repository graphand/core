import FieldTypes from "../enums/field-types";
import Model from "./Model";
import Field from "./Field";
import { FieldOptions } from "../types";

export const fieldDecorator = <T extends FieldTypes>(
  type: T,
  options?: FieldOptions<T>
) => {
  return <T extends Model>(target: T, key: keyof T) => {
    if (!target.model.hasOwnProperty("__fields") || !target.model.__fields) {
      target.model.__fields = new Map<string, Field>();
    }

    target.model.__fields.set(String(key), new Field(type, options));
  };
};
