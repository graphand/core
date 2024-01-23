import { JSONSubtype, JSONType, DecodeRefModel, ModelDefinition } from "@/types";
import { ValidatorDefinition, ValidatorDefinitionOmitField } from "@/types/validators";
import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";

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
    default?: JSONType;
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

export type GenericModelDocument = Partial<Record<string, JSONSubtype>>;

export type ModelTypeMapObject<F extends FieldDefinition<FieldTypes>> = {
  [FieldTypes.ID]: IdType;
  [FieldTypes.TEXT]: F["options"] extends FieldOptionsMap[FieldTypes.TEXT]
    ? F["options"]["options"] extends Array<string>
      ? F["options"]["strict"] extends true
        ? F["options"]["options"][number]
        : F["options"]["options"][number] | string
      : string
    : string;
  [FieldTypes.IDENTITY]: string;
  [FieldTypes.BOOLEAN]: boolean;
  [FieldTypes.NUMBER]: number;
  [FieldTypes.DATE]: Date;
  [FieldTypes.NESTED]: (F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
    ? F["options"]["fields"] extends Record<string, FieldDefinition>
      ? Partial<{
          [K in keyof F["options"]["fields"]]: F["options"]["fields"][K]["type"] extends keyof ModelTypeMapObject<
            F["options"]["fields"][K]
          >
            ? ModelTypeMapObject<F["options"]["fields"][K]>[F["options"]["fields"][K]["type"]]
            : never;
        }>
      : JSONType
    : JSONType) & { __isProxy: boolean };
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
      : F["options"]["items"] extends FieldDefinition
      ? F["options"]["items"]["type"] extends keyof ModelTypeMapObject<F>
        ? Array<ModelTypeMapObject<F["options"]["items"]>[F["options"]["items"]["type"]]>
        : Array<unknown>
      : Array<unknown>
    : Array<unknown>;
};

export type ModelTypeMapDocument<F extends FieldDefinition<FieldTypes>> = Omit<
  ModelTypeMapObject<F>,
  FieldTypes.NESTED | FieldTypes.RELATION | FieldTypes.ARRAY
> & {
  [FieldTypes.NESTED]: F["options"] extends FieldOptionsMap[FieldTypes.NESTED]
    ? F["options"]["fields"] extends Record<string, FieldDefinition>
      ? Partial<{
          [K in keyof F["options"]["fields"]]: F["options"]["fields"][K]["type"] extends keyof ModelTypeMapJSON<
            F["options"]["fields"][K]
          >
            ? ModelTypeMapJSON<F["options"]["fields"][K]>[F["options"]["fields"][K]["type"]]
            : never;
        }>
      : JSONType
    : JSONType;
  [FieldTypes.RELATION]: IdType;
  [FieldTypes.ARRAY]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
    ? F["options"]["items"]["type"] extends FieldTypes.RELATION
      ? Array<IdType>
      : F["options"]["items"] extends FieldDefinition
      ? F["options"]["items"]["type"] extends keyof ModelTypeMapDocument<F>
        ? Array<ModelTypeMapDocument<F["options"]["items"]>[F["options"]["items"]["type"]]>
        : Array<unknown>
      : Array<unknown>
    : Array<unknown>;
};

export type ModelTypeMapJSON<F extends FieldDefinition<FieldTypes>> = Omit<
  ModelTypeMapDocument<F>,
  FieldTypes.ID | FieldTypes.RELATION | FieldTypes.ARRAY | FieldTypes.DATE
> & {
  [FieldTypes.ID]: string;
  [FieldTypes.RELATION]: string;
  [FieldTypes.DATE]: string;
  [FieldTypes.ARRAY]: F["options"] extends FieldOptionsMap[FieldTypes.ARRAY]
    ? F["options"]["items"] extends FieldDefinition
      ? F["options"]["items"]["type"] extends keyof ModelTypeMapJSON<F>
        ? Array<ModelTypeMapJSON<F["options"]["items"]>[F["options"]["items"]["type"]]>
        : Array<unknown>
      : Array<unknown>
    : Array<unknown>;
};

export type FieldsToObject<D extends ModelDefinition["fields"]> = Partial<{
  [F in keyof D]: D[F]["type"] extends keyof ModelTypeMapObject<FieldDefinition>
    ? ModelTypeMapObject<D[F]>[D[F]["type"]]
    : unknown;
}>;

export type FieldsToDocument<D extends ModelDefinition["fields"]> = Partial<{
  [F in keyof D]: D[F]["type"] extends keyof ModelTypeMapDocument<FieldDefinition>
    ? ModelTypeMapDocument<D[F]>[D[F]["type"]]
    : unknown;
}>;

export type FieldsToJSON<D extends ModelDefinition["fields"]> = Partial<{
  [F in keyof D]: D[F]["type"] extends keyof ModelTypeMapJSON<FieldDefinition>
    ? ModelTypeMapJSON<D[F]>[D[F]["type"]]
    : unknown;
}>;

export type ModelObject<M extends typeof Model, D = undefined> = (D extends ModelDefinition
  ? FieldsToObject<D["fields"]>
  : unknown) &
  (M extends { definition: { fields: infer R } }
    ? R extends ModelDefinition["fields"]
      ? FieldsToObject<R> & unknown
      : unknown
    : unknown) &
  FieldsToObject<SystemFields>;

export type ModelJSON<M extends typeof Model, D = undefined> = (D extends ModelDefinition
  ? FieldsToJSON<D["fields"]>
  : unknown) &
  (M extends { definition: { fields: infer R } }
    ? R extends ModelDefinition["fields"]
      ? FieldsToJSON<R> & unknown
      : unknown
    : unknown) &
  FieldsToJSON<SystemFields>;

export type ModelDocument<M extends typeof Model, D = undefined> = (D extends ModelDefinition
  ? FieldsToDocument<D["fields"]>
  : unknown) &
  (M extends { definition: { fields: infer R } }
    ? R extends ModelDefinition["fields"]
      ? FieldsToDocument<R> & unknown
      : unknown
    : unknown) &
  FieldsToDocument<SystemFields>;
