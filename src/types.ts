import Model from "./lib/Model";
import ModelList from "./lib/ModelList";
import FieldTypes from "./enums/field-types";
import RuleActions from "./enums/rule-actions";
import ValidatorTypes from "./enums/validator-types";
import Field from "./lib/Field";
import ErrorCodes from "./enums/error-codes";
import Validator from "./lib/Validator";
import ValidationError from "./lib/ValidationError";
import PromiseModel from "./lib/PromiseModel";
import PromiseModelList from "./lib/PromiseModelList";

export type DefaultFieldDefinitionOptions<T extends FieldTypes> =
  T extends FieldTypes.TEXT
    ? {
        multiple: false;
        creatable: true;
      }
    : T extends FieldTypes.RELATION
    ? {
        model: null;
        multiple: true;
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

type PromiseModelOn<T extends Model> = PromiseModel<T> & {};

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

export type DefaultFieldIdDefinition<
  D extends FieldDefinitionOptions<FieldTypes.ID>
> = string;

export type DefaultFieldTextDefinition<
  D extends FieldDefinitionOptions<FieldTypes.TEXT>
> =
  | (D["multiple"] extends true
      ? FieldTextDefinitionSingleType<D["options"], D["creatable"]>[]
      : FieldTextDefinitionSingleType<D["options"], D["creatable"]>)
  | undefined;

export type DefaultFieldBooleanDefinition<
  D extends FieldDefinitionOptions<FieldTypes.BOOLEAN>
> = boolean | undefined;

export type DefaultFieldNumberDefinition<
  D extends FieldDefinitionOptions<FieldTypes.NUMBER>
> = number | undefined;

export type DefaultFieldDateDefinition<
  D extends FieldDefinitionOptions<FieldTypes.DATE>
> = Date | undefined;

export type DefaultFieldJSONDefinition<
  D extends FieldDefinitionOptions<FieldTypes.JSON>
> = D | any | undefined;

export type DefaultFieldRelationDefinition<
  D extends FieldDefinitionOptions<FieldTypes.RELATION>
> =
  | (D["multiple"] extends true
      ? ModelList<D["model"]> | PromiseModelList<D["model"]>
      : D["model"] | PromiseModelOn<D["model"]>)
  | undefined;

export type SortDirection =
  | 1
  | -1
  | "asc"
  | "desc"
  | "ascending"
  | "descending"
  | {
      $meta: string;
    };

export type Sort =
  | string
  | Exclude<
      SortDirection,
      {
        $meta: string;
      }
    >
  | string[]
  | {
      [key: string]: SortDirection;
    }
  | Map<string, SortDirection>
  | [string, SortDirection][]
  | [string, SortDirection];

export type Filter = Record<string, any>;

export type PopulateOption = {
  path: string;
  filter?: Filter;
  populate?: Populate;
};

export type PopulatePath = string | PopulateOption;

export type Populate = PopulatePath | PopulatePath[] | Record<string, any>;

export type JSONQuery = {
  filter?: Filter;
  sort?: Sort;
  count?: boolean;
  ids?: string[];
  limit?: number;
  skip?: number;
  page?: number;
  pageSize?: number;
  populate?: Populate;
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

export type ValidatorOptionsMap = {
  [ValidatorTypes.REQUIRED]: { field: string };
  [ValidatorTypes.UNIQUE]: { field: string };
  [ValidatorTypes.CONFIG_KEY]: { field: string };
  [ValidatorTypes.SAMPLE]: { field: string };
  [ValidatorTypes.LENGTH]: { field: string; min?: number; max?: number };
  [ValidatorTypes.BOUNDARIES]: { field: string; min?: number; max?: number };
  [ValidatorTypes.REGEX]: {
    field: string;
    pattern: string;
    options?: Partial<Array<"i" | "m" | "s" | "u" | "y">>;
  };
};

export type ValidatorOptions<T extends ValidatorTypes = ValidatorTypes> =
  T extends keyof ValidatorOptionsMap
    ? ValidatorOptionsMap[T]
    : Record<string, never>;

export type ValidatorDefinition<T extends ValidatorTypes = ValidatorTypes> =
  T extends keyof ValidatorOptionsMap
    ? {
        type: T;
        options: ValidatorOptionsMap[T];
      }
    : {
        type: T;
        options?: Record<string, never>;
      };

export type ValidatorsDefinition = Array<ValidatorDefinition>;

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
};

export type FieldOptions<T extends FieldTypes = FieldTypes> =
  T extends keyof FieldOptionsMap ? FieldOptionsMap[T] : Record<string, never>;

export type FieldDefinition<T extends FieldTypes = FieldTypes> =
  T extends keyof FieldOptionsMap
    ? {
        type: T;
        options?: FieldOptionsMap[T];
      }
    : {
        type: T;
        options?: Record<string, never>;
      };

export type FieldsDefinition = {
  [slug: string]: FieldDefinition;
};

export type DocumentDefinition = { [key: string]: any };

export type InputModelPayload<M extends typeof Model> = Partial<
  Omit<ModelDocument<InstanceType<M>>, ModelDocumentBaseFields>
>;

export type ModelDocumentBaseFields =
  | "_id"
  | "_createdAt"
  | "_createdBy"
  | "_updatedAt"
  | "_updatedBy";

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

export type ModelCreateEvent = {
  operation?: "create";
  model: string;
  ids: Array<string>;
  data: Array<any>;
};

export type ModelUpdateEvent = {
  operation?: "update";
  model: string;
  ids: Array<string>;
  data: Array<any>;
};

export type ModelDeleteEvent = {
  operation?: "delete";
  model: string;
  ids: Array<string>;
};

export type ModelCrudEvent =
  | ModelCreateEvent
  | ModelUpdateEvent
  | ModelDeleteEvent;

export type IdentityString = string;
