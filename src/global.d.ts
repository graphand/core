import type {
  DefaultFieldBooleanDefinition,
  DefaultFieldDefinitionOptions,
  DefaultFieldIdDefinition,
  DefaultFieldTextDefinition,
  DefaultFieldRelationDefinition,
  DefaultFieldNumberDefinition,
  DefaultFieldDateDefinition,
  DefaultFieldNestedDefinition,
  FieldDefinitionOptions,
  DefaultFieldArrayDefinition,
  BaseTransactionCtx,
  BaseSerializerCtx,
} from "@/types";
import type FieldTypes from "@/enums/field-types";

declare global {
  export type TransactionCtx = BaseTransactionCtx;
  export type SerializerCtx = BaseSerializerCtx;

  export type FieldDefinitionId<
    D extends FieldDefinitionOptions<FieldTypes.ID> = DefaultFieldDefinitionOptions<FieldTypes.ID>,
  > = DefaultFieldIdDefinition<D>;

  export type FieldDefinitionArray<
    D extends FieldDefinitionOptions<FieldTypes.ARRAY> = DefaultFieldArrayDefinition<FieldTypes.ARRAY>,
  > = DefaultFieldArrayDefinition<D>;

  export type FieldDefinitionText<
    D extends FieldDefinitionOptions<FieldTypes.TEXT> = DefaultFieldDefinitionOptions<FieldTypes.TEXT>,
  > = DefaultFieldTextDefinition<D>;

  export type FieldDefinitionBoolean<
    D extends FieldDefinitionOptions<FieldTypes.BOOLEAN> = DefaultFieldDefinitionOptions<FieldTypes.BOOLEAN>,
  > = DefaultFieldBooleanDefinition<D>;

  export type FieldDefinitionNumber<
    D extends FieldDefinitionOptions<FieldTypes.NUMBER> = DefaultFieldDefinitionOptions<FieldTypes.NUMBER>,
  > = DefaultFieldNumberDefinition<D>;

  export type FieldDefinitionDate<
    D extends FieldDefinitionOptions<FieldTypes.DATE> = DefaultFieldDefinitionOptions<FieldTypes.DATE>,
  > = DefaultFieldDateDefinition<D>;

  export type FieldDefinitionNested<
    D extends FieldDefinitionOptions<FieldTypes.NESTED> = DefaultFieldDefinitionOptions<FieldTypes.NESTED>,
  > = DefaultFieldNestedDefinition<D>;

  export type FieldDefinitionRelation<
    D extends FieldDefinitionOptions<FieldTypes.RELATION> = DefaultFieldDefinitionOptions<FieldTypes.RELATION>,
  > = DefaultFieldRelationDefinition<D>;
}
