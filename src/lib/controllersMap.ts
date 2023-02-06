import { ControllerDefinition } from "../types";

const _controllersMap = {
  modelCount: {
    path: "/:model/count",
    methods: ["GET", "POST"],
    scope: "project",
  },
  modelCreate: {
    path: "/:model",
    methods: ["POST"],
    scope: "project",
  },
  modelDelete: {
    path: "/:model/:id?",
    methods: ["DELETE"],
    scope: "project",
  },
  modelQuery: {
    path: "/:model/query",
    methods: ["GET", "POST"],
    scope: "project",
  },
  modelRead: {
    path: "/:model/:id?",
    methods: ["GET"],
    scope: "project",
  },
  modelUpdate: {
    path: "/:model/:id?",
    methods: ["PATCH"],
    scope: "project",
  },
  currentAccount: {
    path: "/accounts/current",
    methods: ["GET", "POST"],
    scope: "project",
  },
  currentUser: {
    path: "/users/current",
    methods: ["GET", "POST"],
    scope: "global",
  },
  infos: {
    path: "/",
    methods: ["GET", "POST"],
    scope: "global",
  },
  infosProject: {
    path: "/",
    methods: ["GET", "POST"],
    scope: "project",
  },
  loginAccount: {
    path: "/auth/login",
    methods: ["POST"],
    scope: "project",
  },
  loginUser: {
    path: "/auth/login",
    methods: ["POST"],
    scope: "global",
  },
  config: {
    path: "/config",
    methods: ["GET"],
    scope: "project",
  },
  configSync: {
    path: "/config/sync",
    methods: ["POST"],
    scope: "project",
  },
  openapi: {
    path: "/openapi",
    methods: ["GET"],
    scope: "project",
  },
};

const controllersMap = _controllersMap as Record<
  keyof typeof _controllersMap,
  ControllerDefinition
>;

export default controllersMap;
