enum ErrorCodes {
  UNKNOWN = "UNKNOWN",
  INVALID_ADAPTER = "INVALID_ADAPTER",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  INVALID_MODEL_ADAPTER = "INVALID_MODEL_ADAPTER",
  INVALID_MODEL_SLUG = "INVALID_MODEL_SLUG",
  UNAUTHORIZED = "UNAUTHORIZED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_MAX_GEN = "TOKEN_MAX_GEN",
  NOT_FOUND = "NOT_FOUND",
  INVALID_PARAMS = "INVALID_PARAMS",
  INVALID_TOKEN = "INVALID_TOKEN",
  INVALID_SUBQUERY = "INVALID_SUBQUERY",
  INVALID_INVITATION = "INVALID_INVITATION",
  INVALID_CONFIG = "INVALID_CONFIG",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  SCRIPT_EXECUTION_ERROR = "SCRIPT_EXECUTION_ERROR",
}

export default ErrorCodes;
