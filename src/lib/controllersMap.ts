import { ControllerDefinition } from "../types";
import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";

const _getModelScope: ControllerDefinition["scope"] = ({ model }) => {
  const _model = Model.getFromSlug(model);

  if (_model.controllersScope) return _model.controllersScope;
  if (!_model || _model.scope === ModelEnvScopes.GLOBAL) return "global";

  return "project";
};

const controllersMap = {
  modelCount: {
    path: "/:model/count",
    methods: ["get", "post"],
    secured: true,
    scope: _getModelScope,
  },
  modelCreate: {
    path: "/:model",
    methods: ["post"],
    secured: true,
    scope: _getModelScope,
  },
  modelDelete: {
    path: "/:model/:id?",
    methods: ["delete"],
    secured: true,
    scope: _getModelScope,
  },
  modelQuery: {
    path: "/:model/query",
    methods: ["get", "post"],
    secured: true,
    scope: _getModelScope,
  },
  modelRead: {
    path: "/:model/:id?",
    methods: ["get"],
    secured: true,
    scope: _getModelScope,
  },
  modelUpdate: {
    path: "/:model/:id?",
    methods: ["patch"],
    secured: true,
    scope: _getModelScope,
  },
  currentAccount: {
    path: "/accounts/current",
    methods: ["get"],
    scope: "project",
    secured: true,
  },
  currentUser: {
    path: "/users/current",
    methods: ["get"],
    scope: "global",
    secured: true,
  },
  confirmEmail: {
    path: "/confirm-email",
    methods: ["post"],
    scope: "global",
    secured: false,
  },
  infos: {
    path: "/",
    methods: ["get"],
    scope: "global",
    secured: false,
  },
  infosProject: {
    path: "/",
    methods: ["get"],
    scope: "project",
    secured: false,
  },
  loginAccount: {
    path: "/auth/login",
    methods: ["post"],
    scope: "project",
    secured: false,
  },
  genAccountToken: {
    path: "/accounts/:id/gen-token",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  loginUser: {
    path: "/auth/login",
    methods: ["post"],
    scope: "global",
    secured: false,
  },
  ql: {
    path: "/ql",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  sync: {
    path: "/sync",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  openapiGlobal: {
    path: "/oas/global",
    methods: ["get"],
    scope: "global",
    secured: false,
  },
  openapiProject: {
    path: "/oas/project",
    methods: ["get"],
    scope: "global",
    secured: false,
  },
  openapiCurrent: {
    path: "/oas/current",
    methods: ["get"],
    scope: "project",
    secured: false,
  },
  refreshTokenUser: {
    path: "/auth/refresh",
    methods: ["post"],
    scope: "global",
    secured: false,
  },
  refreshTokenAccount: {
    path: "/auth/refresh",
    methods: ["post"],
    scope: "project",
    secured: false,
  },
  genTokenToken: {
    path: "/tokens/:id/gen",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  genKeyToken: {
    path: "/keys/:id/gen",
    methods: ["post"],
    scope: "project",
    secured: false,
  },
  genKeyPair: {
    path: "/keys/gen-key-pair",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  oauth: {
    path: "/auth/oauth",
    methods: ["get", "post"],
    scope: "global",
    secured: false,
  },
  registerUser: {
    path: "/auth/register",
    methods: ["post"],
    scope: "global",
    secured: false,
  },
  registerAccount: {
    path: "/auth/register",
    methods: ["post"],
    scope: "project",
    secured: false,
  },
  handleAuth: {
    path: "/auth/handle",
    methods: ["get"],
    scope: "project",
    secured: false,
  },
  codeAuth: {
    path: "/auth/code",
    methods: ["get"],
    scope: "project",
    secured: false,
  },
  configureAuth: {
    path: "/auth/configure",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  mediaPublic: {
    path: "/medias/public/:id",
    methods: ["get"],
    scope: "project",
    secured: false,
  },
  mediaPrivate: {
    path: "/medias/private/:id",
    methods: ["get"],
    scope: "project",
    secured: true,
  },
  statusSockethook: {
    path: "/sockethooks/:id/status",
    methods: ["get"],
    scope: "project",
    secured: true,
  },
  subscriptionsWebhook: {
    path: "/subscriptions/stripe-webhook",
    methods: ["post"],
    scope: "global",
    secured: false,
  },
  subscriptionsUpgrade: {
    path: "/subscriptions/upgrade",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  subscriptionsCurrent: {
    path: "/subscriptions/current",
    methods: ["get"],
    scope: "project",
    secured: true,
  },
  subscriptionsPortal: {
    path: "/subscriptions/portal",
    methods: ["get"],
    scope: "project",
    secured: true,
  },
  organizationInvite: {
    path: "/organizations/:id/invite",
    methods: ["post"],
    scope: "global",
    secured: true,
  },
  organizationJoin: {
    path: "/organizations/:id/join",
    methods: ["post"],
    scope: "global",
    secured: true,
  },
  organizationConsent: {
    path: "/organizations/:id/consent",
    methods: ["post"],
    scope: "global",
    secured: true,
  },
  termsLatest: {
    path: "/terms/latest",
    methods: ["get"],
    scope: "global",
    secured: false,
  },
  recoverPassword: {
    path: "/recover-password/:id?",
    methods: ["post"],
    scope: "global",
    secured: false,
  },
  jobLogs: {
    path: "/jobs/:id/logs",
    methods: ["get"],
    scope: "project",
    secured: true,
  },
  searchQuery: {
    path: "/search/:id/query",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  searchCount: {
    path: "/search/:id/count",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  searchReset: {
    path: "/search/:id/reset",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
  backupRestore: {
    path: "/backups/:id/restore",
    methods: ["post"],
    scope: "project",
    secured: true,
  },
};

export default controllersMap as Record<
  keyof typeof controllersMap,
  ControllerDefinition
>;
