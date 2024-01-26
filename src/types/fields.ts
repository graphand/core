import { JSONSubtype, DecodeRefModel, ModelDefinition } from "@/types";
import { ValidatorDefinition, ValidatorDefinitionOmitField } from "@/types/validators";
import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
import { JSONTypeObject, SerializerFormat } from "..";

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

export type FieldTypeMap<F extends FieldDefinition<FieldTypes>> = {
  [FieldTypes.ID]: {
    [SerializerFormat.JSON]: string;
    [SerializerFormat.OBJECT]: IdType;
    [SerializerFormat.DOCUMENT]: IdType;
  };
  [FieldTypes.IDENTITY]: {
    [SerializerFormat.JSON]: string;
    [SerializerFormat.OBJECT]: string;
    [SerializerFormat.DOCUMENT]: string;
  };
  [FieldTypes.BOOLEAN]: {
    [SerializerFormat.JSON]: boolean;
    [SerializerFormat.OBJECT]: boolean;
    [SerializerFormat.DOCUMENT]: boolean;
  };
  [FieldTypes.NUMBER]: {
    [SerializerFormat.JSON]: number;
    [SerializerFormat.OBJECT]: number;
    [SerializerFormat.DOCUMENT]: number;
  };
  [FieldTypes.DATE]: {
    [SerializerFormat.JSON]: string;
    [SerializerFormat.OBJECT]: Date;
    [SerializerFormat.DOCUMENT]: Date;
  };
  [FieldTypes.TEXT]: {
    [SerializerFormat.JSON]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
      ? F["options"]["options"] extends Array<string>
        ? F["options"]["strict"] extends true
          ? F["options"]["options"][number]
          : F["options"]["options"][number] | string
        : string
      : string;
    [SerializerFormat.OBJECT]: FieldTypeMap<F>[FieldTypes.TEXT][SerializerFormat.JSON];
    [SerializerFormat.DOCUMENT]: FieldTypeMap<F>[FieldTypes.TEXT][SerializerFormat.JSON];
  };
  [FieldTypes.NESTED]: {
    [SerializerFormat.JSON]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends Record<string, FieldDefinition>
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                SerializerFormat.JSON
              >;
            }>
          : unknown) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], SerializerFormat.JSON>;
              }
            : unknown) &
          JSONTypeObject
      : JSONTypeObject;
    [SerializerFormat.OBJECT]: (F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends Record<string, FieldDefinition>
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                SerializerFormat.OBJECT
              >;
            }>
          : unknown) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<F["options"]["defaultField"], SerializerFormat.OBJECT>;
              }
            : unknown) &
          JSONTypeObject
      : JSONTypeObject) & {
      __isProxy: boolean;
    };
    [SerializerFormat.DOCUMENT]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
      ? (F["options"]["fields"] extends Record<string, FieldDefinition>
          ? Partial<{
              [K in keyof F["options"]["fields"]]: InferFieldType<
                F["options"]["fields"][K],
                SerializerFormat.DOCUMENT
              >;
            }>
          : unknown) &
          (F["options"]["defaultField"] extends FieldDefinition
            ? {
                [x: string]: InferFieldType<
                  F["options"]["defaultField"],
                  SerializerFormat.DOCUMENT
                >;
              }
            : unknown) &
          JSONTypeObject
      : JSONTypeObject;
  };
  [FieldTypes.RELATION]: {
    [SerializerFormat.JSON]: string;
    [SerializerFormat.OBJECT]: F["options"] extends FieldOptionsMap[FieldTypes.RELATION]
      ? F["options"]["ref"] extends string
        ? PromiseModel<DecodeRefModel<F["options"]["ref"]>>
        : PromiseModel<typeof Model>
      : PromiseModel<typeof Model>;
    [SerializerFormat.DOCUMENT]: IdType;
  };
  [FieldTypes.ARRAY]: {
    [SerializerFormat.JSON]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? Array<InferFieldType<F["options"]["items"], SerializerFormat.JSON>>
      : Array<unknown>;
    [SerializerFormat.OBJECT]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? F["options"]["items"]["type"] extends FieldTypes.RELATION
        ? F["options"]["items"]["options"] extends FieldOptionsMap[FieldTypes.RELATION]
          ? PromiseModelList<DecodeRefModel<F["options"]["items"]["options"]["ref"]>>
          : PromiseModelList<typeof Model>
        : Array<InferFieldType<F["options"]["items"], SerializerFormat.OBJECT>>
      : Array<unknown>;
    [SerializerFormat.DOCUMENT]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
      ? F["options"]["items"]["type"] extends FieldTypes.RELATION
        ? Array<IdType>
        : Array<InferFieldType<F["options"]["items"], SerializerFormat.DOCUMENT>>
      : Array<unknown>;
  };
};

export type GenericModelDocument = Partial<Record<string, JSONSubtype>>;

export type InferFieldType<
  D extends FieldDefinition,
  F extends SerializerFormat,
> = D extends FieldDefinition
  ? F extends keyof FieldTypeMap<D>[D["type"]]
    ? FieldTypeMap<D>[D["type"]][F]
    : unknown
  : unknown;

export type ModelDocument<M extends typeof Model, D = undefined> = InferModelDef<
  M,
  SerializerFormat.DOCUMENT,
  D
>;

export type InferModelDef<
  M extends typeof Model,
  S extends SerializerFormat = SerializerFormat.OBJECT,
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
