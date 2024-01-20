import type {
  DefaultFieldBooleanDefinition,
  DefaultFieldIdDefinition,
  DefaultFieldTextDefinition,
  DefaultFieldRelationDefinition,
  DefaultFieldNumberDefinition,
  DefaultFieldDateDefinition,
  DefaultFieldNestedDefinition,
  FieldDefinitionOptions,
  DefaultFieldArrayDefinition,
  DefaultTransactionCtx,
  DefaultSerializerCtx,
} from "@/types";
import type FieldTypes from "@/enums/field-types";

declare global {
  export type TransactionCtx = DefaultTransactionCtx;

  export type SerializerCtx = DefaultSerializerCtx;

  export type FieldDefinitionId = DefaultFieldIdDefinition;

  export type FieldDefinitionArray<D extends FieldDefinitionOptions<FieldTypes.ARRAY>> =
    DefaultFieldArrayDefinition<D>;

  export type FieldDefinitionText<
    D extends FieldDefinitionOptions<FieldTypes.TEXT> = {
      options: [];
      strict: false;
    },
  > = DefaultFieldTextDefinition<D>;

  export type FieldDefinitionBoolean = DefaultFieldBooleanDefinition;

  export type FieldDefinitionNumber = DefaultFieldNumberDefinition;

  export type FieldDefinitionDate = DefaultFieldDateDefinition;

  export type FieldDefinitionNested<D extends FieldDefinitionOptions<FieldTypes.NESTED>> =
    DefaultFieldNestedDefinition<D>;

  export type FieldDefinitionRelation<D extends FieldDefinitionOptions<FieldTypes.RELATION>> =
    DefaultFieldRelationDefinition<D>;
}
