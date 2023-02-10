import Model from "./lib/Model";
import ModelList from "./lib/ModelList";
import FieldTypes from "./enums/field-types";
import RuleActions from "./enums/rule-actions";
import ValidatorTypes from "./enums/validator-types";
import Field from "./lib/Field";
import ErrorCodes from "./enums/error-codes";
import Validator from "./lib/Validator";
import ValidationError from "./lib/ValidationError";
import { ExecutorCtx } from "./global";

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
  configKey?: string;
};

export type AdapterFetcher<T extends typeof Model = typeof Model> = {
  count: (
    args: [query: string | JSONQuery],
    ctx: ExecutorCtx
  ) => Promise<number | null>;
  get: (
    args: [query: string | JSONQuery],
    ctx: ExecutorCtx
  ) => Promise<InstanceType<T> | null>;
  getList: (
    args: [query: JSONQuery],
    ctx: ExecutorCtx
  ) => Promise<ModelList<InstanceType<T>>>;
  createOne: (
    args: [payload: InputModelPayload<T>],
    ctx: ExecutorCtx
  ) => Promise<InstanceType<T>>;
  createMultiple: (
    args: [payload: Array<InputModelPayload<T>>],
    ctx: ExecutorCtx
  ) => Promise<Array<InstanceType<T>>>;
  updateOne: (
    args: [query: string | JSONQuery, update: any],
    ctx: ExecutorCtx
  ) => Promise<InstanceType<T>>;
  updateMultiple: (
    args: [query: JSONQuery, update: any],
    ctx: ExecutorCtx
  ) => Promise<Array<InstanceType<T>>>;
  deleteOne: (
    args: [query: string | JSONQuery],
    ctx: ExecutorCtx
  ) => Promise<boolean>;
  deleteMultiple: (
    args: [query: JSONQuery],
    ctx: ExecutorCtx
  ) => Promise<string[]>;
  getModelDefinition: (
    args: never,
    ctx: ExecutorCtx
  ) => Promise<AdapterFetcherModelDefinition<T>>;
};

export type Module<T extends typeof Model = any> = (model: T) => void;

export type ValidatorDefinition<
  T extends keyof ValidatorOptionsMap = keyof ValidatorOptionsMap
> = {
  type: T;
  options: ValidatorOptions<T>;
};

export type FieldDefinition<
  T extends keyof FieldOptionsMap = keyof FieldOptionsMap
> = {
  type: T;
  options?: FieldOptions<T>;
};

export type FieldsDefinition = {
  [slug: string]: FieldDefinition;
};

export type DocumentDefinition = { [key: string]: any };

export type ValidatorsDefinition = ValidatorDefinition[];

export type ValidatorOptionsMap = {
  [ValidatorTypes.REQUIRED]: { field: string };
  [ValidatorTypes.UNIQUE]: { field: string };
  [ValidatorTypes.CONFIG_KEY]: { field: string };
  [ValidatorTypes.LENGTH]: { field: string; min?: number; max?: number };
  [ValidatorTypes.BOUNDARIES]: { field: string; min?: number; max?: number };
  [ValidatorTypes.REGEX]: {
    field: string;
    pattern: string;
    options?: Partial<Array<"i" | "m" | "s" | "u" | "y">>;
  };
  [ValidatorTypes.DATAMODEL_CONFIG_KEY]: never;
  [ValidatorTypes.SAMPLE]: never;
};

export type ValidatorOptions<T extends ValidatorTypes> = ValidatorOptionsMap[T];

export type FieldOptionsMap = {
  [FieldTypes.TEXT]: {
    default?: string;
    multiple?: boolean;
    options?: string[];
    creatable?: boolean;
  };
  [FieldTypes.RELATION]: {
    ref: string;
    multiple?: boolean;
  };
  [FieldTypes.NUMBER]: {
    default?: number;
  };
  [FieldTypes.JSON]: {
    default?: { [key: string]: any };
    multiple?: boolean;
    defaultField?: FieldDefinition;
    fields?: FieldsDefinition;
    strict?: boolean;
    validators?: ValidatorsDefinition;
  };
  [FieldTypes.BOOLEAN]: {
    default?: boolean;
  };
  [FieldTypes.DATE]: never;
  [FieldTypes.ID]: never;
};

export type FieldOptions<T extends FieldTypes> = FieldOptionsMap[T];

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
  ? { args: Parameters<AdapterFetcher<T>[A]>[0]; ctx: ExecutorCtx }
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

export type CoreErrorDefinition = {
  message?: string;
  code?: ErrorCodes | string;
};

export type ValidationFieldErrorDefinition = {
  slug: string;
  field: Field;
  validationError?: ValidationError;
};

export type ValidationValidatorErrorDefinition = {
  validator: Validator;
};

export type ControllerDefinition = {
  path: string;
  methods: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS">;
  scope: "global" | "project" | ((args: any) => "global" | "project");
  secured: boolean;
};
