import type Model from "@/lib/Model";
import type ModelList from "@/lib/ModelList";
import type Field from "@/lib/Field";
import type ErrorCodes from "@/enums/error-codes";
import type Validator from "@/lib/Validator";
import type ValidationError from "@/lib/ValidationError";
import type AuthProviders from "@/enums/auth-providers";
import type AuthMethods from "@/enums/auth-methods";
import type Sockethook from "@/models/Sockethook";
import type MergeRequestTypes from "@/enums/merge-request-types";
import type MergeRequestEventTypes from "@/enums/merge-request-event-types";
import type { models } from "@/.";
import type Role from "@/models/Role";
import type {
  FieldDefinition,
  InferModelDef,
  ModelJSON,
  SerializerFieldsMap,
} from "@/types/fields";
import type { ValidatorDefinition } from "@/types/validators";
import type { TransactionCtx } from "./ctx";
export * from "./fields";
export * from "./validators";
export * from "./ctx";

export type Rule = ModelInstance<typeof Role>["rules"][number];
export type FieldsRestriction = ModelInstance<typeof Role>["fieldsRestrictions"][number];
export type SerializerFormat = keyof SerializerFieldsMap<FieldDefinition>;
export type FieldsDefinition = Record<string, FieldDefinition>;
export type ValidatorsDefinition = Array<ValidatorDefinition>;

export type JSONSubtype =
  | null
  | string
  | number
  | Date
  | boolean
  | JSONSubtypeArray
  | { [key: string]: JSONSubtype };

export type JSONSubtypeArray = Array<JSONSubtype>;

export type JSONTypeObject = Record<string, JSONSubtype>;

export type JSONType = JSONTypeObject | JSONSubtypeArray;

export type Transaction<
  M extends typeof Model = typeof Model,
  A extends keyof AdapterFetcher<M> = keyof AdapterFetcher<M>,
  Args extends Parameters<AdapterFetcher<M>[A]>[0] = Parameters<AdapterFetcher<M>[A]>[0],
> = {
  model: M;
  action: A;
  args: Args;
  retryToken?: symbol;
  abortToken?: symbol;
};

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

export type Filter = JSONSubtype;

export type PopulateOption = {
  path: string;
  populate?: Populate;
  query?: JSONQuery;
};

export type PopulatePath = string | PopulateOption;

export type Populate = PopulatePath | PopulatePath[];

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

export type UpdateObject = {
  $currentDate?: JSONTypeObject;
  $inc?: JSONTypeObject;
  $min?: JSONTypeObject;
  $max?: JSONTypeObject;
  $mul?: JSONTypeObject;
  $rename?: JSONTypeObject;
  $set?: JSONTypeObject;
  $setOnInsert?: JSONTypeObject;
  $unset?: JSONTypeObject;
  $addToSet?: JSONTypeObject;
  $pop?: JSONTypeObject;
  $pull?: JSONTypeObject;
  $push?: JSONTypeObject;
  $pullAll?: JSONTypeObject;
  $bit?: JSONTypeObject;
};

export type AdapterFetcher<T extends typeof Model = typeof Model> = {
  count: (args: [query: string | JSONQuery], ctx: TransactionCtx) => Promise<number | null>;
  get: (args: [query: string | JSONQuery], ctx: TransactionCtx) => Promise<ModelInstance<T> | null>;
  getList: (args: [query: JSONQuery], ctx: TransactionCtx) => Promise<ModelList<T>>;
  createOne: (args: [payload: ModelJSON<T>], ctx: TransactionCtx) => Promise<ModelInstance<T>>;
  createMultiple: (
    args: [payload: Array<ModelJSON<T>>],
    ctx: TransactionCtx,
  ) => Promise<Array<ModelInstance<T>>>;
  updateOne: (
    args: [query: string | JSONQuery, update: UpdateObject],
    ctx: TransactionCtx,
  ) => Promise<ModelInstance<T>>;
  updateMultiple: (
    args: [query: JSONQuery, update: UpdateObject],
    ctx: TransactionCtx,
  ) => Promise<Array<ModelInstance<T>>>;
  deleteOne: (args: [query: string | JSONQuery], ctx: TransactionCtx) => Promise<boolean>;
  deleteMultiple: (args: [query: JSONQuery], ctx: TransactionCtx) => Promise<string[]>;
  initialize?: (args: never, ctx: TransactionCtx) => Promise<void>;
};

export type Module<T extends typeof Model = typeof Model> = (model: T) => void;

export interface RefModelsMap {
  accounts: typeof models.Account;
  authProviders: typeof models.AuthProvider;
  backups: typeof models.Backup;
  datamodels: typeof models.DataModel;
  environments: typeof models.Environment;
  jobs: typeof models.Job;
  keys: typeof models.Key;
  medias: typeof models.Media;
  mergeRequests: typeof models.MergeRequest;
  mergeRequestEvents: typeof models.MergeRequestEvent;
  organizations: typeof models.Organization;
  projects: typeof models.Project;
  roles: typeof models.Role;
  searchConfigs: typeof models.SearchConfig;
  settings: typeof models.Settings;
  sockethooks: typeof models.Sockethook;
  terms: typeof models.Terms;
  tokens: typeof models.Token;
  users: typeof models.User;
}

export type DecodeRefModel<T extends string> = T extends keyof RefModelsMap
  ? RefModelsMap[T]
  : typeof Model;

export type ModelInstance<M extends typeof Model = typeof Model> =
  (M["definition"] extends ModelDefinition ? InstanceType<typeof Model> : unknown) &
    InstanceType<M> &
    InferModelDef<M, "object">;

export type HookPhase = "before" | "after";

export type HookCallbackArgs<
  P extends HookPhase,
  A extends keyof AdapterFetcher<T>,
  T extends typeof Model,
> = P extends "before"
  ? {
      args: Parameters<AdapterFetcher<T>[A]>[0];
      ctx: TransactionCtx;
      transaction: Transaction<T, A>;
      err?: Array<Error | symbol>;
    }
  : HookCallbackArgs<"before", A, T> & {
      res?: ReturnType<AdapterFetcher<T>[A]>;
    };

export type Hook<
  P extends HookPhase = HookPhase,
  A extends keyof AdapterFetcher<T> = keyof AdapterFetcher<typeof Model>,
  T extends typeof Model = typeof Model,
> = {
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
  data?: Array<JSONType>;
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
  hook: ModelJSON<typeof Sockethook> & {
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
    gdx: JSONTypeObject;
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
    apply: JSONTypeObject;
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

export type AccountAuthConfiguration<T extends AuthProviders = AuthProviders> =
  T extends keyof AccountAuthConfigurationMap
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

export type ModelDefinition = Readonly<{
  keyField?: Readonly<string>;
  single?: Readonly<boolean>;
  fields?: Readonly<FieldsDefinition>;
  validators?: Readonly<ValidatorsDefinition>;
}>;
