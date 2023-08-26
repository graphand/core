import "./modules/validators";
import Model from "./lib/Model";
import DataModel from "./models/DataModel";
import Account from "./models/Account";
import AccountAuthProvider from "./models/AccountAuthProvider";
import AuthProvider from "./models/AuthProvider";
import Project from "./models/Project";
import User from "./models/User";
import Role from "./models/Role";
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
import AuthProviders from "./enums/auth-providers";
import AuthMethods from "./enums/auth-methods";
import IdentityTypes from "./enums/identity-types";
import Patterns from "./enums/patterns";
import {
  getFieldFromDefinition,
  getValidatorFromDefinition,
  validateDocs,
  getFieldsPathsFromPath,
  getNestedFieldsMap,
  defineFieldsProperties,
  getAdaptedModel,
} from "./lib/utils";
import { modelDecorator } from "./lib/modelDecorator";
import { fieldDecorator } from "./lib/fieldDecorator";

const models = {
  Account,
  AccountAuthProvider,
  AuthProvider,
  DataModel,
  Project,
  User,
  Organization,
  Role,
  Token,
  Environment,
  Media,
  Sockethook,
  Key,
  Terms,
};

export {
  Model,
  ModelList,
  Adapter,
  Account,
  AccountAuthProvider,
  AuthProvider,
  Data,
  Project,
  User,
  Organization,
  Token,
  Environment,
  Role,
  DataModel,
  Media,
  Sockethook,
  Key,
  Terms,
  models,
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
  getFieldFromDefinition,
  getValidatorFromDefinition,
  ValidationFieldError,
  ValidationValidatorError,
  controllersMap,
  validateDocs,
  ErrorCodes,
  defaultFieldsMap,
  getFieldsPathsFromPath,
  getNestedFieldsMap,
  defineFieldsProperties,
  getAdaptedModel,
  modelDecorator,
  fieldDecorator,
};

export * from "./types";
