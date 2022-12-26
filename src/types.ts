import Model from "./lib/Model";
import PromiseModel from "./lib/PromiseModel";
import PromiseModelList from "./lib/PromiseModelList";
import ModelList from "./lib/ModelList";
import Field from "./lib/Field";
import SerializerFormat from "./enums/serializer-format";
import FieldTypes from "./enums/field-types";
import RuleActions from "./enums/rule-actions";

export type ParseableFieldDefinition<Def extends any> = Def | any;

export type FieldIdDefinition = string;

export type FieldBooleanDefinition = boolean;

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

export type AdapterFetcher<T extends typeof Model = any> = {
  count: (query?: string | JSONQuery) => Promise<number | null>;
  get: (query?: string | JSONQuery) => Promise<InstanceType<T> | null>;
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
  getFields: () => Promise<
    { type: FieldTypes; label: string; slug: string; options?: any }[]
  >;
};

export type AdapterSerializerField<T extends typeof Model, F extends Field> = {
  serialize: (
    value: any,
    format: SerializerFormat,
    field: F,
    from: InstanceType<T>
  ) => any;
};

export type AdapterSerializer<T extends typeof Model = any> = {
  [key in FieldTypes]?: AdapterSerializerField<T, Field<key>>;
};

export type Module<T extends typeof Model = any> = (model: T) => void;

export type FieldDefinition<T extends FieldTypes = any> = {
  slug: string;
  type: T;
  options?: FieldOptions<T>;
};

export type FieldOptions<T extends string | FieldTypes> = T extends
  | FieldTypes.TEXT
  | "Text"
  ? {
      default?: string;
      multiple?: boolean;
      options?: string[];
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
  : T extends FieldTypes.JSON | "JSON"
  ? {
      default?: number;
      multiple?: boolean;
      fields?: FieldDefinition[];
      strict?: boolean;
    }
  : never;

export type InputModelPayload<M extends typeof Model> = Partial<
  Omit<ModelDocument<InstanceType<M>>, ModelDocumentBaseFields>
>;

export type ModelDocumentBaseFields =
  | "_id"
  | "createdAt"
  | "createdBy"
  | "updatedAt"
  | "updatedBy";

export type ModelDocument<M extends Model> = Record<keyof M, any>;

export type HookPhase = "before" | "after";

export type HookCallbackArgs<
  P extends HookPhase,
  A extends keyof AdapterFetcher
> = P extends "before"
  ? { args: Parameters<AdapterFetcher[A]> }
  : HookCallbackArgs<"before", A> & {
      res?: ReturnType<AdapterFetcher[A]>;
      err?: Error[];
    };

export type Hook<P extends HookPhase, A extends keyof AdapterFetcher> = {
  phase: P;
  action: A;
  fn: (args: HookCallbackArgs<P, A>) => void;
};

export type Rule = {
  ref: string;
  actions?: RuleActions[];
  filter?: object;
  prohibition?: boolean;
};

export type FieldsRestriction = {
  ref?: string;
  actions?: RuleActions[];
  filter?: object;
  fields: string[];
};
