import Model from "./lib/Model";
import ModelList from "./lib/ModelList";
import FieldTypes from "./enums/field-types";
import RuleActions from "./enums/rule-actions";
import ValidatorTypes from "./enums/validator-types";
import Field from "./lib/Field";

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
  fields: FieldsDefinition;
  validators: ValidatorsDefinition;
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

export type Module<T extends typeof Model = any> = (model: T) => void;

export type ValidatorDefinition<T extends ValidatorTypes = ValidatorTypes> = {
  type: T;
  options: ValidatorOptions<T>;
};

export type FieldDefinition<T extends FieldTypes = FieldTypes> = {
  type: T;
  options?: FieldOptions<T>;
};

export type FieldsDefinition = {
  [slug: string]: FieldDefinition;
};

export type DocumentDefinition = { [key: string]: any };

export type ValidatorsDefinition = ValidatorDefinition[];

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
      creatable?: boolean;
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
      default?: { [key: string]: any };
      multiple?: boolean;
      defaultField?: FieldDefinition;
      fields?: FieldsDefinition;
      strict?: boolean;
      validators?: ValidatorsDefinition;
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

export type ValidatorHook<
  P extends HookPhase = HookPhase,
  A extends keyof AdapterFetcher<T> = keyof AdapterFetcher<typeof Model>,
  T extends typeof Model = typeof Model
> = [P, A, (args: HookCallbackArgs<P, A, T>) => boolean];

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

export type ValidateCtx = {
  model: typeof Model;
  fieldsJSONPath?: Array<{ slug: string; field: Field }>;
} & any;
