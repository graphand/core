enum RuleActions {
  CREATE = "create", // generic
  READ = "read", // generic
  UPDATE = "update", // generic
  DELETE = "delete", // generic
  COUNT = "count", // generic
  LOGIN = "login", // auth
  REGISTER = "register", // auth
  EXECUTE = "execute", // aggregations / elasticsearch
}

export default RuleActions;
