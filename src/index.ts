import "./modules/validators";
import Model from "./lib/Model";
import DataModel from "./models/DataModel";
import Account from "./models/Account";
import AccountAuthProvider from "./models/AccountAuthProvider";
import AuthProvider from "./models/AuthProvider";
import Backup from "./models/Backup";
import Job from "./models/Job";
import Project from "./models/Project";
import User from "./models/User";
import Role from "./models/Role";
import SearchConfig from "./models/SearchConfig";
import Key from "./models/Key";
import Organization from "./models/Organization";
import Media from "./models/Media";
import Sockethook from "./models/Sockethook";
import Token from "./models/Token";
import Terms from "./models/Terms";
import Environment from "./models/Environment";
import ModelList from "./lib/ModelList";
import ModelEnvScopes from "./enums/model-env-scopes";
import FieldTypes from "./enums/field-types";
import PromiseModel from "./lib/PromiseModel";
import PromiseModelList from "./lib/PromiseModelList";
import Data from "./lib/Data";
import SerializerFormat from "./enums/serializer-format";
import RuleActions from "./enums/rule-actions";
import Adapter from "./lib/Adapter";
import Field from "./lib/Field";
import Validator from "./lib/Validator";
import ValidatorTypes from "./enums/validator-types";
import ErrorCodes from "./enums/error-codes";
import CoreError from "./lib/CoreError";
import ValidationError from "./lib/ValidationError";
import controllersMap from "./lib/controllersMap";
import ValidationFieldError from "./lib/ValidationFieldError";
import ValidationValidatorError from "./lib/ValidationValidatorError";
import defaultFieldsMap from "./lib/defaultFieldsMap";
import defaultValidatorsMap from "./lib/defaultValidatorsMap";
import AuthProviders from "./enums/auth-providers";
import AuthMethods from "./enums/auth-methods";
import IdentityTypes from "./enums/identity-types";
import Patterns from "./enums/patterns";
import SearchConfigStatus from "./enums/search-config-status";
import JobTypes from "./enums/job-types";
import JobStatus from "./enums/job-status";
import BackupStatus from "./enums/backup-status";
import {
  getFieldFromDefinition,
  getValidatorFromDefinition,
  getFieldsPathsFromPath,
  getNestedFieldsMap,
  defineFieldsProperties,
  getAdaptedModel,
  validateModel,
  getNestedValidatorsArray,
  getArrayValidatorsArray,
} from "./lib/utils";
import { modelDecorator } from "./lib/modelDecorator";
import { fieldDecorator } from "./lib/fieldDecorator";

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
  Organization,
  Project,
  Role,
  SearchConfig,
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
  Organization,
  Project,
  Role,
  SearchConfig,
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
  SerializerFormat,
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
  SearchConfigStatus,
  JobTypes,
  JobStatus,
  BackupStatus,
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
  getAdaptedModel,
  validateModel,
  getNestedValidatorsArray,
  getArrayValidatorsArray,
  modelDecorator,
  fieldDecorator,
};

export * from "./types";
