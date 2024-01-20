import type Model from "@/lib/Model";
import type ModelList from "@/lib/ModelList";
import type FieldTypes from "@/enums/field-types";
import type RuleActions from "@/enums/rule-actions";
import type ValidatorTypes from "@/enums/validator-types";
import type Field from "@/lib/Field";
import type ErrorCodes from "@/enums/error-codes";
import type Validator from "@/lib/Validator";
import type ValidationError from "@/lib/ValidationError";
import type PromiseModel from "@/lib/PromiseModel";
import type PromiseModelList from "@/lib/PromiseModelList";
import AuthProviders from "@/enums/auth-providers";
import AuthMethods from "@/enums/auth-methods";
import Sockethook from "@/models/Sockethook";
import MergeRequestTypes from "@/enums/merge-request-types";
import MergeRequestEventTypes from "./enums/merge-request-event-types";

type Transaction<
  M extends typeof Model = typeof Model,
  A extends keyof AdapterFetcher<M> = keyof AdapterFetcher<M>,
  Args extends Parameters<AdapterFetcher[A]>[0] = Parameters<AdapterFetcher[A]>[0],
> = {
  model: M;
  action: A;
  args: Args;
};

export type CoreTransactionCtx = {
  retryToken: symbol;
  abortToken: symbol;
  transaction: Transaction;
};

export type CoreSerializerCtx = object;

export type DefaultTransactionCtx = {
  disableValidation?: boolean;
  forceOperation?: boolean;
};

export type DefaultSerializerCtx = {
  defaults?: boolean;
  outputFormat?: string;
  transactionCtx?: TransactionCtx;
};

export type FieldDefinitionOptions<
  T extends FieldTypes,
  S extends FieldTypes = FieldTypes,
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

type PromiseModelOn<T extends Model> = PromiseModel<T> & object;

type string_ = string & Partial<any>;

type FieldTextDefinitionSingleType<
  Options extends string[],
  Strict extends boolean = false,
> = Strict extends true ? Options[number] : FieldTextDefinitionSingleType<Options, true> | string_;

type FieldDefinitionType<
  T extends FieldTypes,
  D extends FieldDefinitionOptions<T>,
> = T extends FieldTypes.ID
  ? FieldDefinitionId
  : T extends FieldTypes.TEXT
  ? FieldDefinitionText<D>
  : T extends FieldTypes.BOOLEAN
  ? FieldDefinitionBoolean
  : T extends FieldTypes.NUMBER
  ? FieldDefinitionNumber
  : T extends FieldTypes.DATE
  ? FieldDefinitionDate
  : T extends FieldTypes.NESTED
  ? FieldDefinitionNested<D>
  : T extends FieldTypes.RELATION
  ? FieldDefinitionRelation<D>
  : T extends FieldTypes.ARRAY
  ? FieldDefinitionArray<D>
  : never;

export type DefaultFieldIdDefinition = string;

export type DefaultFieldArrayDefinition<D extends FieldDefinitionOptions<FieldTypes.ARRAY>> =
  D["type"] extends FieldTypes.RELATION
    ? PromiseModelList<D["definition"]>
    : Array<FieldDefinitionType<D["type"], D["definition"]>>;

export type DefaultFieldTextDefinition<D extends FieldDefinitionOptions<FieldTypes.TEXT>> =
  | FieldTextDefinitionSingleType<D["options"], D["strict"]>
  | undefined;

export type DefaultFieldBooleanDefinition = boolean | undefined;

export type DefaultFieldNumberDefinition = number | undefined;

export type DefaultFieldDateDefinition = Date | undefined;

export type DefaultFieldNestedDefinition<
  D extends FieldDefinitionOptions<FieldTypes.NESTED> = Record<string, any>,
> = D | undefined;

export type DefaultFieldRelationDefinition<D extends FieldDefinitionOptions<FieldTypes.RELATION>> =
  | PromiseModelOn<D>
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
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<number | null>;
  get: (
    args: [query: string | JSONQuery],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<InstanceType<T> | null>;
  getList: (
    args: [query: JSONQuery],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<ModelList<InstanceType<T>>>;
  createOne: (
    args: [payload: InputModelPayload<T>],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<InstanceType<T>>;
  createMultiple: (
    args: [payload: Array<InputModelPayload<T>>],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<Array<InstanceType<T>>>;
  updateOne: (
    args: [query: string | JSONQuery, update: UpdateFilter],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<InstanceType<T>>;
  updateMultiple: (
    args: [query: JSONQuery, update: UpdateFilter],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<Array<InstanceType<T>>>;
  deleteOne: (
    args: [query: string | JSONQuery],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<boolean>;
  deleteMultiple: (
    args: [query: JSONQuery],
    ctx: TransactionCtx & CoreTransactionCtx,
  ) => Promise<string[]>;
  initialize?: (args: never, ctx: TransactionCtx & CoreTransactionCtx) => Promise<void>;
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
  T extends ValidatorTypes = keyof ValidatorOptionsMap | ValidatorTypes,
> = T extends keyof ValidatorOptionsMap ? ValidatorOptionsMap[T] : Record<string, never>;

export type ValidatorDefinition<
  T extends ValidatorTypes = keyof ValidatorOptionsMap | ValidatorTypes,
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
  T extends ValidatorTypes = keyof ValidatorOptionsMapOmitField | ValidatorTypes,
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

export type FieldOptionsMap<T extends FieldTypes = FieldTypes> = {
  [FieldTypes.ARRAY]: {
    items: FieldDefinition<T>;
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

export type FieldOptions<T extends FieldTypes = keyof FieldOptionsMap | FieldTypes> =
  T extends keyof FieldOptionsMap ? FieldOptionsMap[T] : Record<string, never>;

export type FieldDefinition<T extends FieldTypes = keyof FieldOptionsMap | FieldTypes> =
  T extends keyof FieldOptionsMap
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
  T extends typeof Model,
> = P extends "before"
  ? {
      args: Parameters<AdapterFetcher<T>[A]>[0];
      ctx: TransactionCtx & CoreTransactionCtx;
      err?: Array<Error | symbol>;
    }
  : HookCallbackArgs<"before", A, T> & {
      res?: ReturnType<AdapterFetcher<T>[A]>;
    };

export type Hook<P extends HookPhase, A extends keyof AdapterFetcher<T>, T extends typeof Model> = {
  phase: P;
  action: A;
  fn: (args: HookCallbackArgs<P, A, T>) => void;
  order?: number;
};

export type ValidatorHook<
  P extends HookPhase = HookPhase,
  A extends keyof AdapterFetcher<T> = keyof AdapterFetcher<typeof Model>,
  T extends typeof Model = typeof Model,
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
  value?: string;
};

export type ControllerDefinition = {
  path: string;
  methods: Array<"get" | "post" | "put" | "delete" | "patch" | "options">;
  scope: "global" | "project" | ((args: { model: string }) => "global" | "project");
  secured: boolean;
};

export type ModelCrudEvent = {
  operation?: "create" | "update" | "delete";
  model: string;
  ids: Array<string>;
  data?: Array<any>;
};

export type FormProcessEvent = {
  type?: "start" | "end" | "progress";
  key: string;
  files: Array<string>;
  percentage?: number;
  contentLength?: number;
  receivedLength: number;
};

export type SockethookEvent<
  P extends HookPhase,
  A extends keyof AdapterFetcher<T>,
  T extends typeof Model,
> = {
  operation: string;
  hook: ModelDocument<Sockethook> & {
    phase: P;
    action: A;
    on: T["slug"];
  };
  data: HookCallbackArgs<P, A, T>;
};

export type SockethookResponse<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  P extends HookPhase,
  A extends keyof AdapterFetcher<T>,
  T extends typeof Model,
> = {
  operation: string;
  args?: Parameters<AdapterFetcher<T>[A]>[0];
  err?: Array<{
    message: string;
  }>;
};

export type SockethookHandler<
  P extends HookPhase,
  A extends keyof AdapterFetcher<T>,
  T extends typeof Model,
> = (
  data: SockethookEvent<P, A, T>["data"],
) =>
  | void
  | Omit<SockethookResponse<P, A, T>, "operation">
  | Promise<void | Omit<SockethookResponse<P, A, T>, "operation">>;

export type SockethookJoinOne = {
  name: string;
  signature?: string;
};

export type IdentityString = string;

export type FieldsPathItem = { key: string; field: Field };

export type MergeRequestOptionsMap = {
  [MergeRequestTypes.STATIC]: {
    gdx: Record<string, any>;
  };
  [MergeRequestTypes.QUERY]: {
    source: string;
    query: Record<string, JSONQuery | true>;
  };
};

export type MergeRequestOptions<
  T extends MergeRequestTypes = keyof MergeRequestOptionsMap | MergeRequestTypes,
> = T extends keyof MergeRequestOptionsMap ? MergeRequestOptionsMap[T] : Record<string, never>;

export type MergeRequestEventDataMap = {
  [MergeRequestEventTypes.COMMENT]: {
    comment: string;
  };
  [MergeRequestEventTypes.PATCH]: {
    apply: Record<string, any>;
    comment?: string;
  };
  [MergeRequestEventTypes.APPROVE]: {
    close?: boolean;
  };
  [MergeRequestEventTypes.REJECT]: {
    comment?: string;
    close?: boolean;
  };
};

export type MergeRequestEventData<
  T extends MergeRequestEventTypes = keyof MergeRequestEventDataMap | MergeRequestEventTypes,
> = T extends keyof MergeRequestEventDataMap ? MergeRequestEventDataMap[T] : Record<string, never>;

export type AuthProviderOptionsMap = {
  [AuthProviders.FACEBOOK]: {
    clientId: string;
    clientSecret: string;
    fieldsMap?: Record<string, string>;
  };
};

export type AuthProviderOptions<
  T extends AuthProviders = keyof AuthProviderOptionsMap | AuthProviders,
> = T extends keyof AuthProviderOptionsMap ? AuthProviderOptionsMap[T] : Record<string, never>;

export type AuthProviderRegisterOptionsMap = {
  [AuthProviders.PASSWORD]: {
    confirmEmail?: boolean;
  };
};

export type AuthProviderRegisterOptions<
  T extends AuthProviders = keyof AuthProviderRegisterOptionsMap | AuthProviders,
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
  T extends AuthProviders = keyof AccountAuthConfigurationMap | AuthProviders,
> = T extends keyof AccountAuthConfigurationMap
  ? AccountAuthConfigurationMap[T]
  : Record<string, never>;

export type AuthProviderCredentialsMap = {
  [AuthProviders.PASSWORD]: {
    email: string;
    password: string;
  };
  [AuthProviders.GRAPHAND]: {
    accountToken?: string; // a jwt token containing the identity of the account to link to user
  };
};

export type AuthProviderCredentials<
  T extends AuthProviders = keyof AuthProviderCredentialsMap | AuthProviders,
> = T extends keyof AuthProviderCredentialsMap
  ? AuthProviderCredentialsMap[T]
  : Record<string, never>;

export type AuthMethodOptionsMap = {
  [AuthMethods.REDIRECT]: {
    redirect?: string;
  };
};

export type AuthMethodOptions<T extends AuthMethods = keyof AuthMethodOptionsMap | AuthMethods> =
  T extends keyof AuthMethodOptionsMap ? AuthMethodOptionsMap[T] : Record<string, never>;

export type AuthProviderConfigurePayloadMap = {
  [AuthProviders.PASSWORD]:
    | {
        password: string;
      }
    | string;
};

export type AuthProviderConfigurePayload<
  T extends AuthProviders = keyof AuthProviderConfigurePayloadMap | AuthProviders,
> = T extends keyof AuthProviderConfigurePayloadMap
  ? AuthProviderConfigurePayloadMap[T]
  : Record<string, never>;

export type SockethookStatus = {
  status: "OK" | "KO";
  target: {
    _id: string;
    name: string;
  };
  responseTime?: number;
  sockets: {
    selected: {
      id: string;
      hostname: string;
    } | null;
    connected: {
      list: Array<{
        id: string;
        hostname: string;
      }>;
      count: number;
    };
  };
};

export type ModelDefinition = {
  keyField?: string;
  single?: boolean;
  fields?: FieldsDefinition;
  validators?: ValidatorsDefinition;
};
