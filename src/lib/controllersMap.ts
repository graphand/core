import { ControllerDefinition } from "../types";
import DataModel from "../models/DataModel";
import ModelEnvScopes from "../enums/model-env-scopes";

const _controllersMap = {
  modelCount: {
    path: "/:model/count",
    methods: ["GET", "POST"],
    secured: true,
    scope: ({ model }) => {
      const Model = DataModel.getFromSlug(model);
      if (Model.scope === ModelEnvScopes.GLOBAL) return "global";
      return "project";
    },
  },
  modelCreate: {
    path: "/:model",
    methods: ["POST"],
    secured: true,
    scope: ({ model }) => {
      const Model = DataModel.getFromSlug(model);
      if (Model.scope === ModelEnvScopes.GLOBAL) return "global";
      return "project";
    },
  },
  modelDelete: {
    path: "/:model/:id?",
    methods: ["DELETE"],
    secured: true,
    scope: ({ model }) => {
      const Model = DataModel.getFromSlug(model);
      if (Model.scope === ModelEnvScopes.GLOBAL) return "global";
      return "project";
    },
  },
  modelQuery: {
    path: "/:model/query",
    methods: ["GET", "POST"],
    secured: true,
    scope: ({ model }) => {
      const Model = DataModel.getFromSlug(model);
      if (Model.scope === ModelEnvScopes.GLOBAL) return "global";
      return "project";
    },
  },
  modelRead: {
    path: "/:model/:id?",
    methods: ["GET"],
    secured: true,
    scope: ({ model }) => {
      const Model = DataModel.getFromSlug(model);
      if (Model.scope === ModelEnvScopes.GLOBAL) return "global";
      return "project";
    },
  },
  modelUpdate: {
    path: "/:model/:id?",
    methods: ["PATCH"],
    secured: true,
    scope: ({ model }) => {
      const Model = DataModel.getFromSlug(model);
      if (Model.scope === ModelEnvScopes.GLOBAL) return "global";
      return "project";
    },
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
  loginUser: {
    path: "/auth/login",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
  config: {
    path: "/config",
    methods: ["GET"],
    scope: "project",
    secured: true,
  },
  configSync: {
    path: "/config/sync",
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
  genToken: {
    path: "/tokens/:id/gen",
    methods: ["POST"],
    scope: "project",
    secured: true,
  },
  registerUser: {
    path: "/auth/register",
    methods: ["POST"],
    scope: "global",
    secured: false,
  },
};

const controllersMap = _controllersMap as Record<
  keyof typeof _controllersMap,
  ControllerDefinition
>;

export default controllersMap;
