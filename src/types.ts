import Model from "./lib/Model";
import PromiseModel from "./lib/PromiseModel";
import PromiseModelList from "./lib/PromiseModelList";
import ModelList from "./lib/ModelList";
import { InputModelPayload } from "./lib/Model";
import Field from "./lib/Field";
import SerializerFormat from "./enums/serializer-format";
import FieldTypes from "./enums/field-types";

export type FieldIdDefinition = string;

export type FieldDateDefinition<
  D extends {
    required?: boolean;
  } = { required: false },
  Required extends boolean = false
> = Required extends true
  ? Date
  : D["required"] extends true
  ? FieldDateDefinition<D, true>
  : FieldDateDefinition<D, true> | undefined;

export type FieldJSONDefinition<T extends { [key: string]: any } = any> =
  | T
  | undefined;

export type FieldNumberDefinition<
  D extends {
    required?: boolean;
  } = { required: false },
  Required extends boolean = false
> = Required extends true
  ? number
  : D["required"] extends true
  ? FieldNumberDefinition<D, true>
  : FieldNumberDefinition<D, true> | undefined;

type PromiseModelOn<T extends Model> = PromiseModel<T> & {};

export type FieldRelationDefinition<
  D extends {
    model: Model;
    multiple?: boolean;
    required?: boolean;
  },
  Required extends boolean = false
> = Required extends true
  ? D["multiple"] extends true
    ? ModelList<D["model"]> | PromiseModelList<D["model"]>
    : D["model"] | PromiseModelOn<D["model"]>
  : D["required"] extends true
  ? FieldRelationDefinition<D, true>
  : FieldRelationDefinition<D, true> | undefined;

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

export type FieldTextDefinition<
  D extends {
    required?: boolean;
    options?: string[];
    multiple?: boolean;
    creatable?: boolean;
  } = { multiple: false; required: false; creatable: true },
  Required extends boolean = false
> = Required extends true
  ? D["multiple"] extends true
    ? FieldTextDefinitionSingleType<D["options"], D["creatable"]>[]
    : FieldTextDefinitionSingleType<D["options"], D["creatable"]>
  : D["required"] extends true
  ? FieldTextDefinition<D, true>
  : FieldTextDefinition<D, true> | undefined;

export type JSONQuery = {
  filter?: any;
  populate?: any;
  sort?: any;
  socket?: string;
  count?: boolean;
  ids?: string[];
  limit?: number;
  skip?: number;
  page?: number;
  pageSize?: number;
};

export type ModelAdapterFetcher<T extends typeof Model> = {
  count: (query?: string | JSONQuery) => Promise<number | null>;
  get: (query?: string | JSONQuery) => Promise<InstanceType<T>>;
  getList: (query?: JSONQuery) => Promise<ModelList<InstanceType<T>>>;
  createOne: (payload: InputModelPayload<T>) => Promise<InstanceType<T>>;
  createMultiple: (
    payload: Array<InputModelPayload<T>>
  ) => Promise<Array<InstanceType<T>>>;
  updateOne: (
    query: string | JSONQuery,
    update: any
  ) => Promise<InstanceType<T>>;
  updateMultiple: (
    query: JSONQuery,
    update: any
  ) => Promise<Array<InstanceType<T>>>;
  deleteOne: (query: string | JSONQuery) => Promise<boolean>;
  deleteMultiple: (query: JSONQuery) => Promise<string[]>;
  loadSchema: () => Promise<any>;
};

export type ModelAdapterSerializerField<
  T extends typeof Model,
  F extends Field
> = {
  serialize: (
    value: any,
    format: SerializerFormat | string,
    field: F,
    from: InstanceType<T>
  ) => any;
};

export type ModelAdapterSerializer<T extends typeof Model> = {
  [key in FieldTypes]?: ModelAdapterSerializerField<T, Field<key>>;
};

export type FieldOptions<T extends string | FieldTypes> = T extends
  | FieldTypes.TEXT
  | "Text"
  ? {
      default?: string;
      multiple?: boolean;
    }
  : T extends FieldTypes.RELATION | "Relation"
  ? {
      ref: string;
      multiple?: boolean;
    }
  : T extends FieldTypes.NUMBER | "Number"
  ? {
      default?: number;
    }
  : never;
