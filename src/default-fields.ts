import { DefaultFieldDefinitionOptions, FieldDefinitionOptions } from "./types";
import Model from "./lib/Model";
import PromiseModel from "./lib/PromiseModel";
import FieldTypes from "./enums/field-types";
import ModelList from "./lib/ModelList";
import PromiseModelList from "./lib/PromiseModelList";

type PromiseModelOn<T extends Model> = PromiseModel<T> & {};

type string_ = string & Partial<any>;

type FieldTextDefinitionSingleType<
  Options extends string[],
  Creatable extends boolean = true,
  DefaultType extends any = string_
> = Options extends string[]
  ? Creatable extends false
    ? Options[number]
    : FieldTextDefinitionSingleType<Options, false> | DefaultType
  : FieldTextDefinitionSingleType<[], Creatable, string>;

export type DefaultFieldIdDefinition<
  D extends FieldDefinitionOptions<FieldTypes.ID> = DefaultFieldDefinitionOptions<FieldTypes.ID>
> = string;

export type DefaultFieldTextDefinition<
  D extends FieldDefinitionOptions<FieldTypes.TEXT> = DefaultFieldDefinitionOptions<FieldTypes.TEXT>
> =
  | (D["multiple"] extends true
      ? FieldTextDefinitionSingleType<D["options"], D["creatable"]>[]
      : FieldTextDefinitionSingleType<D["options"], D["creatable"]>)
  | undefined;

export type DefaultFieldBooleanDefinition<
  D extends FieldDefinitionOptions<FieldTypes.BOOLEAN>
> = boolean | undefined;

export type DefaultFieldNumberDefinition<
  D extends FieldDefinitionOptions<FieldTypes.NUMBER>
> = number | undefined;

export type DefaultFieldDateDefinition<
  D extends FieldDefinitionOptions<FieldTypes.DATE>
> = Date | undefined;

export type DefaultFieldJSONDefinition<
  D extends FieldDefinitionOptions<FieldTypes.JSON>
> = D | any | undefined;

export type DefaultFieldRelationDefinition<
  D extends FieldDefinitionOptions<FieldTypes.RELATION>
> =
  | (D["multiple"] extends true
      ? ModelList<D["model"]> | PromiseModelList<D["model"]>
      : D["model"] | PromiseModelOn<D["model"]>)
  | undefined;
