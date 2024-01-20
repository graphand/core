import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldOptions } from "../types";
/**
 * Decorator to define a field in a model.
 * This is an equivalent to the `fields` property in the model definition.
 * @param type type of the field
 * @param options options of the field, this depends on the type
 */
export declare const fieldDecorator: <T extends FieldTypes>(type: T, options?: FieldOptions<T>) => <M extends Model>(target: M, key: keyof M) => void;
