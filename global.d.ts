import {
  DefaultFieldDefinitionOptions,
  FieldDefinitionOptions,
} from "./dist/types";
import Model from "./dist/lib/Model";
import PromiseModel from "./dist/lib/PromiseModel";
import FieldTypes from "./dist/enums/field-types";
import ModelList from "./dist/lib/ModelList";
import PromiseModelList from "./dist/lib/PromiseModelList";

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
  D extends FieldDefinitionOptions<FieldTypes.ID>
> = string;

export type DefaultFieldTextDefinition<
  D extends FieldDefinitionOptions<FieldTypes.TEXT>
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

declare global {
  export type ExecutorCtx = any;

  export type FieldDefinitionId<
    D extends FieldDefinitionOptions<FieldTypes.ID> = DefaultFieldDefinitionOptions<FieldTypes.ID>
  > = DefaultFieldIdDefinition<D>;

  export type FieldDefinitionText<
    D extends FieldDefinitionOptions<FieldTypes.TEXT> = DefaultFieldDefinitionOptions<FieldTypes.TEXT>
  > = DefaultFieldTextDefinition<D>;

  export type FieldDefinitionBoolean<
    D extends FieldDefinitionOptions<FieldTypes.BOOLEAN> = DefaultFieldDefinitionOptions<FieldTypes.BOOLEAN>
  > = DefaultFieldBooleanDefinition<D>;

  export type FieldDefinitionNumber<
    D extends FieldDefinitionOptions<FieldTypes.NUMBER> = DefaultFieldDefinitionOptions<FieldTypes.NUMBER>
  > = DefaultFieldNumberDefinition<D>;

  export type FieldDefinitionDate<
    D extends FieldDefinitionOptions<FieldTypes.DATE> = DefaultFieldDefinitionOptions<FieldTypes.DATE>
  > = DefaultFieldDateDefinition<D>;

  export type FieldDefinitionJSON<
    D extends FieldDefinitionOptions<FieldTypes.JSON> = DefaultFieldDefinitionOptions<FieldTypes.JSON>
  > = DefaultFieldJSONDefinition<D>;

  export type FieldDefinitionRelation<
    D extends FieldDefinitionOptions<FieldTypes.RELATION> = DefaultFieldDefinitionOptions<FieldTypes.RELATION>
  > = DefaultFieldRelationDefinition<D>;
}
