import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import { FieldDefinition, FieldOptions } from "@/types";

/**
 * Decorator to define a field in a model.
 * This is an equivalent to the `fields` property in the model definition.
 * @param type type of the field
 * @param options options of the field, this depends on the type
 */
export const fieldDecorator = <T extends FieldTypes>(type: T, options?: FieldOptions<T>) => {
  return <M extends Model>(target: M, key: keyof M) => {
    const baseClass = target.model.getBaseClass();

    if (!baseClass.hasOwnProperty("definition") || !baseClass.definition) {
      baseClass.definition = {};
    }

    baseClass.definition.fields ??= {};
    baseClass.definition.fields[String(key)] = {
      type,
      options,
    } as FieldDefinition<T>;
  };
};
