import type {
  FieldDefinitionOptions,
  DefaultTransactionCtx,
  DefaultSerializerCtx,
  FieldTypes,
  FieldDefinitionType,
  FieldTextDefinitionSingleType,
  PromiseModelList,
  PromiseModel,
  Model,
} from "@graphand/core";

declare global {
  export type TransactionCtx = DefaultTransactionCtx;

  export type SerializerCtx = DefaultSerializerCtx;

  export type FieldDefinitionId = string;

  export type FieldDefinitionArray<D extends FieldDefinitionOptions<FieldTypes.ARRAY>> =
    D["type"] extends FieldTypes.RELATION
      ? PromiseModelList<D["options"]>
      : Array<FieldDefinitionType<D["type"], D["options"]>>;

  export type FieldDefinitionText<
    D extends FieldDefinitionOptions<FieldTypes.TEXT> = {
      options: [];
      strict: false;
    },
  > = FieldTextDefinitionSingleType<D["options"], D["strict"]> | undefined;

  export type FieldDefinitionBoolean = boolean | undefined;

  export type FieldDefinitionNumber = number | undefined;

  export type FieldDefinitionDate = Date | undefined;

  export type FieldDefinitionNested<D extends FieldDefinitionOptions<FieldTypes.NESTED>> =
    | D
    | undefined;

  export type FieldDefinitionRelation<
    D extends FieldDefinitionOptions<FieldTypes.RELATION> = typeof Model,
  > = PromiseModel<D> | undefined;
}
