enum RuleActions {
  CREATE = "create", // generic
  READ = "read", // generic
  UPDATE = "update", // generic
  DELETE = "delete", // generic
  COUNT = "count", // generic
  LOGIN = "login", // auth
  REGISTER = "register", // auth
  EXECUTE = "execute", // aggregations / elasticsearch
  ALL = "all", // generic
}

export default RuleActions;
