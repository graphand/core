import "@/modules/validators";

import Model from "@/lib/Model";
import DataModel from "@/models/DataModel";
import Account from "@/models/Account";
import AccountAuthProvider from "@/models/AccountAuthProvider";
import AuthProvider from "@/models/AuthProvider";
import Backup from "@/models/Backup";
import Job from "@/models/Job";
import Project from "@/models/Project";
import User from "@/models/User";
import Role from "@/models/Role";
import SearchConfig from "@/models/SearchConfig";
import Key from "@/models/Key";
import Organization from "@/models/Organization";
import Media from "@/models/Media";
import MergeRequest from "@/models/MergeRequest";
import MergeRequestEvent from "@/models/MergeRequestEvent";
import Sockethook from "@/models/Sockethook";
import Token from "@/models/Token";
import Terms from "@/models/Terms";
import Environment from "@/models/Environment";
import Settings from "@/models/Settings";
import ModelList from "@/lib/ModelList";
import ModelEnvScopes from "@/enums/model-env-scopes";
import FieldTypes from "@/enums/field-types";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
import Data from "@/lib/Data";
import RuleActions from "@/enums/rule-actions";
import Adapter from "@/lib/Adapter";
import Field from "@/lib/Field";
import Validator from "@/lib/Validator";
import ValidatorTypes from "@/enums/validator-types";
import ErrorCodes from "@/enums/error-codes";
import CoreError from "@/lib/CoreError";
import ValidationError from "@/lib/ValidationError";
import controllersMap from "@/lib/controllersMap";
import ValidationFieldError from "@/lib/ValidationFieldError";
import ValidationValidatorError from "@/lib/ValidationValidatorError";
import defaultFieldsMap from "@/lib/defaultFieldsMap";
import defaultValidatorsMap from "@/lib/defaultValidatorsMap";
import AuthProviders from "@/enums/auth-providers";
import AuthMethods from "@/enums/auth-methods";
import IdentityTypes from "@/enums/identity-types";
import Patterns from "@/enums/patterns";
import JobTypes from "@/enums/job-types";
import JobStatus from "@/enums/job-status";
import MergeRequestTypes from "@/enums/merge-request-types";
import MergeRequestEventTypes from "@/enums/merge-request-event-types";
import {
  getFieldFromDefinition,
  getValidatorFromDefinition,
  getFieldsPathsFromPath,
  getNestedFieldsMap,
  defineFieldsProperties,
  validateModel,
  getArrayItemsFieldsMap,
  getNestedValidatorsArray,
  getArrayValidatorsArray,
  crossFields,
} from "@/lib/utils";
import { modelDecorator } from "@/lib/modelDecorator";
export * from "@/types";

const models = {
  Account,
  AccountAuthProvider,
  AuthProvider,
  Backup,
  DataModel,
  Environment,
  Job,
  Key,
  Media,
  MergeRequest,
  MergeRequestEvent,
  Organization,
  Project,
  Role,
  SearchConfig,
  Settings,
  Sockethook,
  Terms,
  Token,
  User,
};

export {
  Model,
  ModelList,
  Adapter,
  Account,
  AccountAuthProvider,
  AuthProvider,
  Backup,
  DataModel,
  Environment,
  Job,
  Key,
  Media,
  MergeRequest,
  MergeRequestEvent,
  Organization,
  Project,
  Role,
  SearchConfig,
  Settings,
  Sockethook,
  Terms,
  Token,
  User,
  models,
  Data,
  ModelEnvScopes,
  FieldTypes,
  PromiseModel,
  PromiseModelList,
  RuleActions,
  Field,
  Validator,
  ValidatorTypes,
  CoreError,
  ValidationError,
  AuthProviders,
  AuthMethods,
  IdentityTypes,
  Patterns,
  JobTypes,
  JobStatus,
  MergeRequestTypes,
  MergeRequestEventTypes,
  getFieldFromDefinition,
  getValidatorFromDefinition,
  ValidationFieldError,
  ValidationValidatorError,
  controllersMap,
  ErrorCodes,
  defaultFieldsMap,
  defaultValidatorsMap,
  getFieldsPathsFromPath,
  getNestedFieldsMap,
  defineFieldsProperties,
  validateModel,
  getNestedValidatorsArray,
  getArrayValidatorsArray,
  getArrayItemsFieldsMap,
  modelDecorator,
  crossFields,
};
