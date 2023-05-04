import type Model from "./lib/Model";
import type ModelList from "./lib/ModelList";
import type FieldTypes from "./enums/field-types";
import type RuleActions from "./enums/rule-actions";
import type ValidatorTypes from "./enums/validator-types";
import type Field from "./lib/Field";
import type ErrorCodes from "./enums/error-codes";
import type Validator from "./lib/Validator";
import type ValidationError from "./lib/ValidationError";
import type PromiseModel from "./lib/PromiseModel";
import type PromiseModelList from "./lib/PromiseModelList";
import AuthProviders from "./enums/auth-providers";
import AuthMethods from "./enums/auth-methods";

export type DefaultFieldDefinitionOptions<T extends FieldTypes> =
  T extends FieldTypes.TEXT
    ? {
        options: [];
        strict: false;
      }
    : T extends FieldTypes.ARRAY
    ? {
        type: FieldTypes.TEXT;
      }
    : T extends FieldTypes.RELATION
    ? {
        model: null;
      }
    : {};

export type FieldDefinitionOptions<
  T extends FieldTypes,
  S extends FieldTypes = FieldTypes
> = T extends FieldTypes.TEXT
  ? {
      options?: Array<string>;
      strict?: boolean;
    }
  : T extends FieldTypes.ARRAY
  ? {
      type: S;
      definition?: FieldDefinitionOptions<S>;
    }
  : T extends FieldTypes.RELATION
  ? Model
  : T extends FieldTypes.NESTED
  ? { [key: string]: any }
  : any;

type PromiseModelOn<T extends Model> = PromiseModel<T> & {};

type string_ = string & Partial<any>;

type FieldTextDefinitionSingleType<
  Options extends string[],
  Strict extends boolean = false
> = Strict extends true
  ? Options[number]
  : FieldTextDefinitionSingleType<Options, true> | string_;

type FieldDefinitionType<
  T extends FieldTypes,
  D extends FieldDefinitionOptions<T>
> = T extends FieldTypes.ID
  ? FieldDefinitionId<D>
  : T extends FieldTypes.TEXT
  ? FieldDefinitionText<D>
  : T extends FieldTypes.BOOLEAN
  ? FieldDefinitionBoolean<D>
  : T extends FieldTypes.NUMBER
  ? FieldDefinitionNumber<D>
  : T extends FieldTypes.DATE
  ? FieldDefinitionDate<D>
  : T extends FieldTypes.NESTED
  ? FieldDefinitionNested<D>
  : T extends FieldTypes.RELATION
  ? FieldDefinitionRelation<D>
  : T extends FieldTypes.ARRAY
  ? FieldDefinitionArray<D>
  : never;

export type DefaultFieldIdDefinition<
  D extends FieldDefinitionOptions<FieldTypes.ID>
> = string;

export type DefaultFieldArrayDefinition<
  D extends FieldDefinitionOptions<FieldTypes.ARRAY>
> = D["type"] extends FieldTypes.RELATION
  ? PromiseModelList<D["definition"]>
  : Array<FieldDefinitionType<D["type"], D["definition"]>>;

export type DefaultFieldTextDefinition<
  D extends FieldDefinitionOptions<FieldTypes.TEXT>
> = FieldTextDefinitionSingleType<D["options"], D["strict"]> | undefined;

export type DefaultFieldBooleanDefinition<
  D extends FieldDefinitionOptions<FieldTypes.BOOLEAN>
> = boolean | undefined;

export type DefaultFieldNumberDefinition<
  D extends FieldDefinitionOptions<FieldTypes.NUMBER>
> = number | undefined;

export type DefaultFieldDateDefinition<
  D extends FieldDefinitionOptions<FieldTypes.DATE>
> = Date | undefined;

export type DefaultFieldNestedDefinition<
  D extends FieldDefinitionOptions<FieldTypes.NESTED> = any
> = D | undefined;

export type DefaultFieldRelationDefinition<
  D extends FieldDefinitionOptions<FieldTypes.RELATION>
> = PromiseModelOn<D> | undefined;

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
  populate?: Populate;
  query?: JSONQuery;
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

export type UpdateFilter = {
  $currentDate?: any;
  $inc?: any;
  $min?: any;
  $max?: any;
  $mul?: any;
  $rename?: any;
  $set?: any;
  $setOnInsert?: any;
  $unset?: any;
  $addToSet?: any;
  $pop?: any;
  $pull?: any;
  $push?: any;
  $pullAll?: any;
  $bit?: any;
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
    args: [query: string | JSONQuery, update: UpdateFilter],
    ctx: ExecutorCtx
  ) => Promise<InstanceType<T>>;
  updateMultiple: (
    args: [query: JSONQuery, update: UpdateFilter],
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
  initialize?: (args: never, ctx: ExecutorCtx) => Promise<void>;
};

export type Module<T extends typeof Model = any> = (model: T) => void;

export type ValidatorOptionsMap = {
  [ValidatorTypes.REQUIRED]: { field: string };
  [ValidatorTypes.UNIQUE]: { field: string };
  [ValidatorTypes.KEY_FIELD]: { field: string };
  [ValidatorTypes.SAMPLE]: { field: string };
  [ValidatorTypes.LENGTH]: { field: string; min?: number; max?: number };
  [ValidatorTypes.BOUNDARIES]: { field: string; min?: number; max?: number };
  [ValidatorTypes.REGEX]: {
    field: string;
    pattern: string;
    options?: Partial<Array<"i" | "m" | "s" | "u" | "y">>;
  };
};

export type ValidatorOptionsMapOmitField = {
  [ValidatorTypes.LENGTH]: { min?: number; max?: number };
  [ValidatorTypes.BOUNDARIES]: { min?: number; max?: number };
  [ValidatorTypes.REGEX]: {
    pattern: string;
    options?: Partial<Array<"i" | "m" | "s" | "u" | "y">>;
  };
};

export type ValidatorOptions<
  T extends ValidatorTypes = keyof ValidatorOptionsMap | ValidatorTypes
> = T extends keyof ValidatorOptionsMap
  ? ValidatorOptionsMap[T]
  : Record<string, never>;

export type ValidatorDefinition<
  T extends ValidatorTypes = keyof ValidatorOptionsMap | ValidatorTypes
> = T extends keyof ValidatorOptionsMap
  ? {
      type: T;
      options: ValidatorOptionsMap[T];
    }
  : {
      type: T;
      options?: Record<string, never>;
    };

export type ValidatorDefinitionOmitField<
  T extends ValidatorTypes = keyof ValidatorOptionsMapOmitField | ValidatorTypes
> = T extends keyof ValidatorOptionsMapOmitField
  ? {
      type: T;
      options: ValidatorOptionsMapOmitField[T];
    }
  : {
      type: T;
      options?: Record<string, never>;
    };

export type ValidatorsDefinition = Array<ValidatorDefinition>;
export type ValidatorsDefinitionOmitField = Array<ValidatorDefinitionOmitField>;

export type FieldOptionsMap = {
  [FieldTypes.ARRAY]: {
    items: FieldDefinition;
    unicity?: boolean;
    validators?: ValidatorsDefinitionOmitField;
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
    default?: { [key: string]: any };
    defaultField?: FieldDefinition;
    fields?: FieldsDefinition;
    strict?: boolean;
    validators?: ValidatorsDefinition;
  };
  [FieldTypes.BOOLEAN]: {
    default?: boolean;
  };
};

export type FieldOptions<
  T extends FieldTypes = keyof FieldOptionsMap | FieldTypes
> = T extends keyof FieldOptionsMap
  ? FieldOptionsMap[T]
  : Record<string, never>;

export type FieldDefinition<
  T extends FieldTypes = keyof FieldOptionsMap | FieldTypes
> = T extends keyof FieldOptionsMap
  ? {
      type: T;
      options?: FieldOptionsMap[T];
    }
  : {
      type: T;
      options?: Record<string, never>;
    };

export type FieldsDefinition = Record<string, FieldDefinition>;

export type DocumentDefinition = Record<string, any>;

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
  ref?: string;
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

export type ModelCrudEvent = {
  __socketId?: string;
} & (ModelCreateEvent | ModelUpdateEvent | ModelDeleteEvent);

export type IdentityString = string;

export type FieldsPathItem = { key: string; field: Field };

export type AuthProviderOptionsMap = {
  [AuthProviders.FACEBOOK]: {
    clientId: string;
    clientSecret: string;
  };
};

export type AuthProviderOptions<
  T extends AuthProviders = keyof AuthProviderOptionsMap | AuthProviders
> = T extends keyof AuthProviderOptionsMap
  ? AuthProviderOptionsMap[T]
  : Record<string, never>;

export type AuthProviderRegisterOptionsMap = {
  [AuthProviders.PASSWORD]: {
    confirmEmail?: boolean;
  };
};

export type AuthProviderRegisterOptions<
  T extends AuthProviders = keyof AuthProviderRegisterOptionsMap | AuthProviders
> = T extends keyof AuthProviderRegisterOptionsMap
  ? AuthProviderRegisterOptionsMap[T]
  : Record<string, never>;

export type AccountAuthConfigurationMap = {
  [AuthProviders.PASSWORD]: {
    password: string;
  };
  [AuthProviders.FACEBOOK]: {
    userId: string;
  };
};

export type AccountAuthConfiguration<
  T extends AuthProviders = keyof AccountAuthConfigurationMap | AuthProviders
> = T extends keyof AccountAuthConfigurationMap
  ? AccountAuthConfigurationMap[T]
  : Record<string, never>;

export type AuthProviderCredentialsMap = {
  [AuthProviders.PASSWORD]: {
    email: string;
    password: string;
  };
};

export type AuthProviderCredentials<
  T extends AuthProviders = keyof AuthProviderCredentialsMap | AuthProviders
> = T extends keyof AuthProviderCredentialsMap
  ? AuthProviderCredentialsMap[T]
  : Record<string, never>;

export type AuthMethodOptionsMap = {
  [AuthMethods.REDIRECT]: {
    redirect?: string;
  };
};

export type AuthMethodOptions<
  T extends AuthMethods = keyof AuthMethodOptionsMap | AuthMethods
> = T extends keyof AuthMethodOptionsMap
  ? AuthMethodOptionsMap[T]
  : Record<string, never>;
