import { DecodeRefModel, ModelDefinition, FieldsDefinition, ValidatorsDefinition } from "@/types";
import { ValidatorDefinitionOmitField } from "@/types/validators";
import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
import { JSONTypeObject, ModelInstance, SerializerCtx, SerializerFormat } from "..";

export type FieldOptionsMap<T extends FieldTypes = FieldTypes> = {
  [FieldTypes.ARRAY]: {
    items: FieldDefinition<T>;
    validators?: Array<ValidatorDefinitionOmitField>;
    distinct?: boolean;
  };
  [FieldTypes.TEXT]: {
    default?: string;
    enum?: string[];
    strict?: boolean;
  };
  [FieldTypes.RELATION]: {
    ref: string;
  };
  [FieldTypes.NUMBER]: {
    default?: number;
  };
  [FieldTypes.NESTED]: {
    default?: JSONTypeObject;
    defaultField?: FieldDefinition;
    dependsOn?: string;
    fields?: FieldsDefinition;
    strict?: boolean;
    validators?: ValidatorsDefinition;
  };
  [FieldTypes.BOOLEAN]: {
    default?: boolean;
  };
};

export type FieldOptions<T extends FieldTypes = FieldTypes> = T extends keyof FieldOptionsMap
  ? FieldOptionsMap[T]
  : never;

export type FieldDefinition<T extends FieldTypes = FieldTypes> = {
  type: T;
  options?: FieldOptions<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _ts?: any;
  _tsModel?: typeof Model;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface SystemFields<M extends typeof Model> {
  _id: { type: FieldTypes.ID };
  _createdAt: { type: FieldTypes.DATE };
  _createdBy: { type: FieldTypes.IDENTITY };
  _updatedAt: { type: FieldTypes.DATE };
  _updatedBy: { type: FieldTypes.IDENTITY };
}

export interface SerializerFieldsMap<F extends FieldDefinition<FieldTypes>> {
  json: {
    [FieldTypes.ID]: string;
    [FieldTypes.IDENTITY]: string;
    [FieldTypes.BOOLEAN]: boolean;
    [FieldTypes.NUMBER]: number;
    [FieldTypes.DATE]: string;
    [FieldTypes.TEXT]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
      ? F["options"]["enum"] extends Array<string>
        ? F["options"]["strict"] extends true
          ? F["options"]["enum"][number]
          : F["options"]["enum"][number] | string
        : string
      : string;
    [FieldTypes.NESTED]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends FieldsDefinition
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                "json"
              >;
            }>
          : {}) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], "json">;
              }
            : {}) &
          (F["options"]["strict"] extends true ? {} : JSONTypeObject)
      : JSONTypeObject;
    [FieldTypes.RELATION]: string;
    [FieldTypes.ARRAY]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? Array<InferFieldType<F["options"]["items"], "json">>
      : Array<unknown>;
  };
  object: {
    [FieldTypes.ID]: string;
    [FieldTypes.IDENTITY]: string;
    [FieldTypes.BOOLEAN]: boolean;
    [FieldTypes.NUMBER]: number;
    [FieldTypes.DATE]: Date;
    [FieldTypes.TEXT]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
      ? F["options"]["enum"] extends Array<string>
        ? F["options"]["strict"] extends true
          ? F["options"]["enum"][number]
          : F["options"]["enum"][number] | string
        : string
      : string;
    [FieldTypes.NESTED]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends FieldsDefinition
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                "object"
              >;
            }>
          : {}) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], "object">;
              }
            : {}) &
          (F["options"]["strict"] extends true ? {} : JSONTypeObject)
      : JSONTypeObject;
    [FieldTypes.RELATION]: F["options"] extends FieldOptionsMap[FieldTypes.RELATION]
      ? F["options"]["ref"] extends string
        ? PromiseModel<
            F["_tsModel"] extends typeof Model ? F["_tsModel"] : DecodeRefModel<F["options"]["ref"]>
          >
        : PromiseModel<typeof Model>
      : PromiseModel<typeof Model>;
    [FieldTypes.ARRAY]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? F["options"]["items"]["type"] extends FieldTypes.RELATION
        ? F["options"]["items"]["options"] extends FieldOptionsMap[FieldTypes.RELATION]
          ? PromiseModelList<DecodeRefModel<F["options"]["items"]["options"]["ref"]>>
          : PromiseModelList<typeof Model>
        : Array<InferFieldType<F["options"]["items"], "object">>
      : Array<unknown>;
  };
  validation: {};
  // nextField: {};
}

export type InferFieldType<
  D extends FieldDefinition,
  F extends SerializerFormat,
> = "_ts" extends keyof D
  ? D["_ts"]
  : F extends keyof SerializerFieldsMap<D>
  ? D["type"] extends keyof SerializerFieldsMap<D>[F]
    ? SerializerFieldsMap<D>[F][D["type"]]
    : unknown
  : unknown;

export type InferModelDef<
  M extends typeof Model,
  S extends SerializerFormat = "object",
> = (M extends { definition: { fields: infer R } }
  ? R extends ModelDefinition["fields"]
    ? Partial<{
        [F in keyof R]: InferFieldType<R[F], S>;
      }> &
        unknown
    : unknown
  : unknown) &
  Partial<{
    [F in keyof SystemFields<M>]: InferFieldType<SystemFields<M>[F], S>;
  }>;

export type ModelObject<M extends typeof Model = typeof Model> = InferModelDef<M, "object">;

export type ModelJSON<M extends typeof Model = typeof Model> = InferModelDef<M, "json">;

export type FieldSerializerInput<S extends SerializerFormat = SerializerFormat> = {
  value: unknown;
  from: ModelInstance;
  ctx: SerializerCtx;
  format: S;
};
