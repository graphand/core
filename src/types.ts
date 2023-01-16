import Model from "./lib/Model";
import ModelList from "./lib/ModelList";
import Field from "./lib/Field";
import SerializerFormat from "./enums/serializer-format";
import FieldTypes from "./enums/field-types";
import RuleActions from "./enums/rule-actions";
import ValidatorTypes from "./enums/validator-types";
import Validator from "./lib/Validator";

// export type FieldIdDefinition = any;
// export type FieldTextDefinition = any;
// export type FieldBooleanDefinition = any;
// export type FieldNumberDefinition = any;
// export type FieldDateDefinition = any;
// export type FieldJSONDefinition = any;
// export type FieldRelationDefinition = any;

export type DefaultFieldDefinitionOptions<T extends FieldTypes> =
  T extends FieldTypes.TEXT
    ? {
        multiple: false;
        creatable: true;
      }
    : {};

export type FieldDefinitionOptions<T extends FieldTypes> =
  T extends FieldTypes.TEXT
    ? {
        options?: string[];
        multiple?: boolean;
        creatable?: boolean;
      }
    : T extends FieldTypes.RELATION
    ? {
        model: Model;
        multiple?: boolean;
      }
    : T extends FieldTypes.JSON
    ? { [key: string]: any }
    : {};

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

export type AdapterFetcherModelDefinition<
  T extends typeof Model = typeof Model
> = {
  fields: FieldDefinition[];
  validators: ValidatorDefinition[];
};

export type AdapterFetcher<T extends typeof Model = typeof Model> = {
  count: (
    args: [query: string | JSONQuery],
    ctx: any
  ) => Promise<number | null>;
  get: (
    args: [query: string | JSONQuery],
    ctx: any
  ) => Promise<InstanceType<T> | null>;
  getList: (
    args: [query: JSONQuery],
    ctx: any
  ) => Promise<ModelList<InstanceType<T>>>;
  createOne: (
    args: [payload: InputModelPayload<T>],
    ctx: any
  ) => Promise<InstanceType<T>>;
  createMultiple: (
    args: [payload: Array<InputModelPayload<T>>],
    ctx: any
  ) => Promise<Array<InstanceType<T>>>;
  updateOne: (
    args: [query: string | JSONQuery, update: any],
    ctx: any
  ) => Promise<InstanceType<T>>;
  updateMultiple: (
    args: [query: JSONQuery, update: any],
    ctx: any
  ) => Promise<Array<InstanceType<T>>>;
  deleteOne: (args: [query: string | JSONQuery], ctx: any) => Promise<boolean>;
  deleteMultiple: (args: [query: JSONQuery], ctx: any) => Promise<string[]>;
  getModelDefinition: (
    args: never,
    ctx: any
  ) => Promise<AdapterFetcherModelDefinition<T>>;
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

export type AdapterValidatorItem<
  T extends typeof Model,
  V extends Validator
> = {};

export type AdapterValidator<T extends typeof Model = any> = {
  [key in ValidatorTypes]?: AdapterValidatorItem<T, Validator<key>>;
};

export type Module<T extends typeof Model = any> = (model: T) => void;

export type ValidatorDefinition<T extends ValidatorTypes = ValidatorTypes> = {
  type: T;
  options?: ValidatorOptions<T>;
};

export type FieldDefinition<T extends FieldTypes = FieldTypes> = {
  slug: string;
  type: T;
  options?: FieldOptions<T>;
};

export type ValidatorOptions<T extends string | ValidatorTypes> = T extends
  | ValidatorTypes.REQUIRED
  | "required"
  ? { field: string }
  : T extends ValidatorTypes.UNIQUE | "unique"
  ? { field: string }
  : never;

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
  : T extends FieldTypes.BOOLEAN | "Boolean"
  ? {
      default?: boolean;
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
  A extends keyof AdapterFetcher<T>,
  T extends typeof Model
> = P extends "before"
  ? { args: Parameters<AdapterFetcher<T>[A]>[0]; ctx: any }
  : HookCallbackArgs<"before", A, T> & {
      res?: ReturnType<AdapterFetcher<T>[A]>;
      err?: Error[];
    };

export type Hook<
  P extends HookPhase,
  A extends keyof AdapterFetcher<T>,
  T extends typeof Model
> = {
  phase: P;
  action: A;
  fn: (args: HookCallbackArgs<P, A, T>) => void;
  order?: number;
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
