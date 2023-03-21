import {
  DefaultFieldBooleanDefinition,
  DefaultFieldDefinitionOptions,
  DefaultFieldIdDefinition,
  DefaultFieldTextDefinition,
  DefaultFieldRelationDefinition,
  DefaultFieldNumberDefinition,
  DefaultFieldDateDefinition,
  DefaultFieldJSONDefinition,
  FieldDefinitionOptions,
  FieldTypes,
} from "./dist/types";

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
