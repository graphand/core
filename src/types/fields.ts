import { JSONSubtype, DecodeRefModel, ModelDefinition } from "@/types";
import { ValidatorDefinition, ValidatorDefinitionOmitField } from "@/types/validators";
import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
import { JSONTypeObject, ModelInstance, SerializerCtx, SerializerFormat } from "..";

export type FieldOptionsMap<T extends FieldTypes = FieldTypes> = {
  [FieldTypes.ARRAY]: {
    items: FieldDefinition<T>;
    validators?: Array<ValidatorDefinitionOmitField>;
  };
  [FieldTypes.TEXT]: {
    default?: string;
    options?: string[];
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
    fields?: Record<string, FieldDefinition>;
    strict?: boolean;
    validators?: Array<ValidatorDefinition>;
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
  options?: T extends keyof FieldOptionsMap ? FieldOptionsMap[T] : never;
};

type SystemFields = {
  _id: { type: FieldTypes.ID };
  _createdAt: { type: FieldTypes.DATE };
  _createdBy: { type: FieldTypes.IDENTITY };
  _updatedAt: { type: FieldTypes.DATE };
  _updatedBy: { type: FieldTypes.IDENTITY };
};

export interface SerializerFieldsMap<F extends FieldDefinition<FieldTypes>> {
  json: {
    [FieldTypes.ID]: string;
    [FieldTypes.IDENTITY]: string;
    [FieldTypes.BOOLEAN]: boolean;
    [FieldTypes.NUMBER]: number;
    [FieldTypes.DATE]: string;
    [FieldTypes.TEXT]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
      ? F["options"]["options"] extends Array<string>
        ? F["options"]["strict"] extends true
          ? F["options"]["options"][number]
          : F["options"]["options"][number] | string
        : string
      : string;
    [FieldTypes.NESTED]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends Record<string, FieldDefinition>
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                "json"
              >;
            }>
          : unknown) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], "json">;
              }
            : unknown) &
          JSONTypeObject
      : JSONTypeObject;
    [FieldTypes.RELATION]: string;
    [FieldTypes.ARRAY]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? Array<InferFieldType<F["options"]["items"], "json">>
      : Array<unknown>;
  };
  object: {
    [FieldTypes.ID]: IdType;
    [FieldTypes.IDENTITY]: string;
    [FieldTypes.BOOLEAN]: boolean;
    [FieldTypes.NUMBER]: number;
    [FieldTypes.DATE]: Date;
    [FieldTypes.TEXT]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
      ? F["options"]["options"] extends Array<string>
        ? F["options"]["strict"] extends true
          ? F["options"]["options"][number]
          : F["options"]["options"][number] | string
        : string
      : string;
    [FieldTypes.NESTED]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends Record<string, FieldDefinition>
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                "object"
              >;
            }>
          : unknown) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], "object">;
              }
            : unknown) &
          JSONTypeObject
      : JSONTypeObject;
    [FieldTypes.RELATION]: F["options"] extends FieldOptionsMap[FieldTypes.RELATION]
      ? F["options"]["ref"] extends string
        ? PromiseModel<DecodeRefModel<F["options"]["ref"]>>
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
  document: {
    [FieldTypes.ID]: IdType;
    [FieldTypes.IDENTITY]: string;
    [FieldTypes.BOOLEAN]: boolean;
    [FieldTypes.NUMBER]: number;
    [FieldTypes.DATE]: Date;
    [FieldTypes.TEXT]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
      ? F["options"]["options"] extends Array<string>
        ? F["options"]["strict"] extends true
          ? F["options"]["options"][number]
          : F["options"]["options"][number] | string
        : string
      : string;
    [FieldTypes.NESTED]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends Record<string, FieldDefinition>
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                "document"
              >;
            }>
          : unknown) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], "document">;
              }
            : unknown) &
          JSONTypeObject
      : JSONTypeObject;
    [FieldTypes.RELATION]: IdType;
    [FieldTypes.ARRAY]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? F["options"]["items"]["type"] extends FieldTypes.RELATION
        ? Array<IdType>
        : Array<InferFieldType<F["options"]["items"], "document">>
      : Array<unknown>;
  };
  validation: {};
  nextField: {};
}

export type GenericModelDocument = Partial<Record<string, JSONSubtype>>;

export type InferFieldType<
  D extends FieldDefinition,
  F extends SerializerFormat,
> = F extends keyof SerializerFieldsMap<D>
  ? D["type"] extends keyof SerializerFieldsMap<D>[F]
    ? SerializerFieldsMap<D>[F][D["type"]]
    : unknown
  : unknown;

export type ModelDocument<M extends typeof Model = typeof Model, D = undefined> = InferModelDef<
  M,
  "document",
  D
>;

export type InferModelDef<
  M extends typeof Model,
  S extends SerializerFormat = "object",
  D = undefined,
> = (D extends ModelDefinition
  ? Partial<{
      [F in keyof D["fields"]]: InferFieldType<D["fields"][F], S>;
    }>
  : unknown) &
  (M extends { definition: { fields: infer R } }
    ? R extends ModelDefinition["fields"]
      ? Partial<{
          [F in keyof R]: InferFieldType<R[F], S>;
        }> &
          unknown
      : unknown
    : unknown) &
  Partial<{
    [F in keyof SystemFields]: InferFieldType<SystemFields[F], S>;
  }>;

export type FieldSerializerInput<S extends SerializerFormat = SerializerFormat> = {
  value: unknown;
  from: ModelInstance;
  ctx: SerializerCtx;
  format: S;
};
