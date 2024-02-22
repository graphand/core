import { ControllerDefinition } from "..";

const controllersMap = {
  modelCount: {
    path: "/:model/count",
    methods: ["get", "post"],
    secured: true,
  },
  modelCreate: {
    path: "/:model",
    methods: ["post"],
    secured: true,
  },
  modelDelete: {
    path: "/:model/:id?",
    methods: ["delete"],
    secured: true,
  },
  modelQuery: {
    path: "/:model/query",
    methods: ["get", "post"],
    secured: true,
  },
  modelRead: {
    path: "/:model/:id?",
    methods: ["get"],
    secured: true,
  },
  modelUpdate: {
    path: "/:model/:id?",
    methods: ["patch"],
    secured: true,
  },
  currentAccount: {
    path: "/accounts/current",
    methods: ["get"],
    secured: true,
  },
  infosProject: {
    path: "/",
    methods: ["get"],
    secured: false,
  },
  loginAccount: {
    path: "/auth/login",
    methods: ["post"],
    secured: false,
  },
  genAccountToken: {
    path: "/accounts/:id/gen-token",
    methods: ["post"],
    secured: true,
  },
  gdxQuery: {
    path: "/gdx/query",
    methods: ["post"],
    secured: true,
  },
  gdxSync: {
    path: "/gdx/sync",
    methods: ["post"],
    secured: true,
  },
  openapi: {
    path: "/oas",
    methods: ["get"],
    secured: false,
  },
  refreshTokenAccount: {
    path: "/auth/refresh",
    methods: ["post"],
    secured: false,
  },
  genTokenToken: {
    path: "/tokens/:id/gen",
    methods: ["post"],
    secured: true,
  },
  genKeyToken: {
    path: "/keys/:id/gen",
    methods: ["post"],
    secured: false,
  },
  genKeyPair: {
    path: "/keys/gen-key-pair",
    methods: ["post"],
    secured: true,
  },
  registerAccount: {
    path: "/auth/register",
    methods: ["post"],
    secured: false,
  },
  handleAuth: {
    path: "/auth/handle",
    methods: ["get"],
    secured: false,
  },
  codeAuth: {
    path: "/auth/code",
    methods: ["get"],
    secured: false,
  },
  configureAuth: {
    path: "/auth/configure",
    methods: ["post"],
    secured: false,
  },
  mediaPublic: {
    path: "/medias/public/:id",
    methods: ["get"],
    secured: false,
  },
  mediaPrivate: {
    path: "/medias/private/:id",
    methods: ["get"],
    secured: true,
  },
  subscriptionsUpgrade: {
    path: "/subscriptions/upgrade",
    methods: ["post"],
    secured: true,
  },
  subscriptionsCurrent: {
    path: "/subscriptions/current",
    methods: ["get"],
    secured: true,
  },
  subscriptionsPortal: {
    path: "/subscriptions/portal",
    methods: ["get"],
    secured: true,
  },
  searchQuery: {
    path: "/search/:id/query",
    methods: ["post"],
    secured: true,
  },
  searchCount: {
    path: "/search/:id/count",
    methods: ["post"],
    secured: true,
  },
  searchReset: {
    path: "/search/:id/reset",
    methods: ["post"],
    secured: true,
  },
  mrGDX: {
    path: "/merge-requests/:id/gdx",
    methods: ["get"],
    secured: true,
  },
  // backupRestore: {
  //   path: "/backups/:id/restore",
  //   methods: ["post"],
  //   secured: true,
  // },
  // jobLogs: {
  //   path: "/jobs/:id/logs",
  //   methods: ["get"],
  //   secured: true,
  // },
} satisfies Record<string, ControllerDefinition>;

export default controllersMap;
