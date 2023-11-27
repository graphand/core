import { ControllerDefinition } from "../types";
import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";

const _getModelScope: ControllerDefinition["scope"] = ({ model }) => {
  const _model = Model.getFromSlug(model);

  if (!_model || _model.scope === ModelEnvScopes.GLOBAL) return "global";
  if (_model.controllersScope) return _model.controllersScope;

  return "project";
};

const controllersMap = {
  modelCount: {
    path: "/:model/count",
    methods: ["GET", "POST"],
    secured: true,
    scope: _getModelScope,
  },
  modelCreate: {
    path: "/:model",
    methods: ["POST"],
    secured: true,
    scope: _getModelScope,
  },
  modelDelete: {
    path: "/:model/:id?",
    methods: ["DELETE"],
    secured: true,
    scope: _getModelScope,
  },
  modelQuery: {
    path: "/:model/query",
    methods: ["GET", "POST"],
    secured: true,
    scope: _getModelScope,
  },
  modelRead: {
    path: "/:model/:id?",
    methods: ["GET"],
    secured: true,
    scope: _getModelScope,
  },
  modelUpdate: {
    path: "/:model/:id?",
    methods: ["PATCH"],
    secured: true,
    scope: _getModelScope,
  },
  currentAccount: {
    path: "/accounts/current",
    methods: ["GET", "POST"],
    scope: "project",
    secured: true,
  },
  currentUser: {
    path: "/users/current",
    methods: ["GET", "POST"],
    scope: "global",
    secured: true,
  },
  confirmEmail: {
    path: "/confirm-email",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  infos: {
    path: "/",
    methods: ["GET", "POST"],
    scope: "global",
    secured: false,
  },
  infosProject: {
    path: "/",
    methods: ["GET", "POST"],
    scope: "project",
    secured: false,
  },
  deployment: {
    path: "/deployment",
    methods: ["GET", "POST"],
    scope: "project",
    secured: false,
  },
  loginAccount: {
    path: "/auth/login",
    methods: ["POST"],
    scope: "project",
    secured: false,
  },
  genAccountToken: {
    path: "/accounts/:id/gen-token",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  loginUser: {
    path: "/auth/login",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  ql: {
    path: "/ql",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  sync: {
    path: "/sync",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  openapi: {
    path: "/openapi",
    methods: ["GET"],
    scope: "project",
    secured: true,
  },
  refreshTokenUser: {
    path: "/auth/refresh",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  refreshTokenAccount: {
    path: "/auth/refresh",
    methods: ["POST"],
    scope: "project",
    secured: false,
  },
  genTokenToken: {
    path: "/tokens/:id/gen",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  genKeyToken: {
    path: "/keys/:id/gen",
    methods: ["POST"],
    scope: "project",
    secured: false,
  },
  genKeyPair: {
    path: "/keys/gen-key-pair",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  oauth: {
    path: "/auth/oauth",
    methods: ["GET", "POST"],
    scope: "global",
    secured: false,
  },
  registerUser: {
    path: "/auth/register",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  registerAccount: {
    path: "/auth/register",
    methods: ["POST"],
    scope: "project",
    secured: false,
  },
  handleAuth: {
    path: "/auth/handle",
    methods: ["GET", "POST"],
    scope: "project",
    secured: false,
  },
  codeAuth: {
    path: "/auth/code",
    methods: ["GET", "POST"],
    scope: "project",
    secured: false,
  },
  configureAuth: {
    path: "/auth/configure",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  mediaPublic: {
    path: "/medias/public/:id?",
    methods: ["GET"],
    scope: "project",
    secured: false,
  },
  mediaPrivate: {
    path: "/medias/private/:id?",
    methods: ["GET"],
    scope: "project",
    secured: true,
  },
  statusSockethook: {
    path: "/sockethooks/:id/status",
    methods: ["GET", "POST"],
    scope: "project",
    secured: true,
  },
  subscriptionsWebhook: {
    path: "/subscriptions/stripe-webhook",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  subscriptionsUpgrade: {
    path: "/subscriptions/upgrade",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  subscriptionsCurrent: {
    path: "/subscriptions/current",
    methods: ["GET", "POST"],
    scope: "project",
    secured: true,
  },
  subscriptionsPortal: {
    path: "/subscriptions/portal",
    methods: ["GET", "POST"],
    scope: "project",
    secured: true,
  },
  organizationInvite: {
    path: "/organizations/:id/invite",
    methods: ["POST"],
    scope: "global",
    secured: true,
  },
  organizationJoin: {
    path: "/organizations/:id/join",
    methods: ["POST"],
    scope: "global",
    secured: true,
  },
  organizationConsent: {
    path: "/organizations/:id/consent",
    methods: ["POST"],
    scope: "global",
    secured: true,
  },
  termsLatest: {
    path: "/terms/latest",
    methods: ["GET"],
    scope: "global",
    secured: false,
  },
  recoverPassword: {
    path: "/recover-password/:id?",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  jobLogs: {
    path: "/jobs/:id/logs",
    methods: ["GET"],
    scope: "project",
    secured: true,
  },
  searchQuery: {
    path: "/search/:id/query",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  searchCount: {
    path: "/search/:id/count",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  searchReset: {
    path: "/search/:id/reset",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  backupRestore: {
    path: "/backups/:id/restore",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
};

export default controllersMap as Record<
  keyof typeof controllersMap,
  ControllerDefinition
>;
