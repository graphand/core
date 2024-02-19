import "@/modules/validators";
import "@/modules/register-models";

import Model from "@/lib/Model";
import DataModel from "@/models/DataModel";
import Account from "@/models/Account";
import AuthProvider from "@/models/AuthProvider";
import Job from "@/models/Job";
import Role from "@/models/Role";
import SearchConfig from "@/models/SearchConfig";
import Key from "@/models/Key";
import Media from "@/models/Media";
import MergeRequest from "@/models/MergeRequest";
import MergeRequestEvent from "@/models/MergeRequestEvent";
import Token from "@/models/Token";
import Invitation from "@/models/Invitation";
import Environment from "@/models/Environment";
import Settings from "@/models/Settings";
import ModelList from "@/lib/ModelList";
import FieldTypes from "@/enums/field-types";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
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
import FieldId from "@/lib/fields/Id";
import FieldNumber from "@/lib/fields/Number";
import FieldBoolean from "@/lib/fields/Boolean";
import FieldDate from "@/lib/fields/Date";
import FieldText from "@/lib/fields/Text";
import FieldRelation from "@/lib/fields/Relation";
import FieldNested from "@/lib/fields/Nested";
import FieldIdentity from "@/lib/fields/Identity";
import FieldArray from "@/lib/fields/Array";
import ValidatorUnique from "@/lib/validators/Unique";
import ValidatorRegex from "@/lib/validators/Regex";
import ValidatorKeyField from "@/lib/validators/KeyField";
import ValidatorDatamodelSlug from "@/lib/validators/DatamodelSlug";
import ValidatorDatamodelDefinition from "@/lib/validators/DatamodelDefinition";
import ValidatorLength from "@/lib/validators/Length";
import ValidatorBoundaries from "@/lib/validators/Boundaries";
import ValidatorRequired from "@/lib/validators/Required";

export {
  Model,
  ModelList,
  Adapter,
  Account,
  AuthProvider,
  DataModel,
  Environment,
  Invitation,
  Job,
  Key,
  Media,
  MergeRequest,
  MergeRequestEvent,
  Role,
  SearchConfig,
  Settings,
  Token,
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
  getFieldsPathsFromPath,
  getNestedFieldsMap,
  defineFieldsProperties,
  validateModel,
  getNestedValidatorsArray,
  getArrayValidatorsArray,
  getArrayItemsFieldsMap,
  modelDecorator,
  crossFields,
  FieldId,
  FieldNumber,
  FieldBoolean,
  FieldDate,
  FieldText,
  FieldRelation,
  FieldNested,
  FieldIdentity,
  FieldArray,
  ValidatorUnique,
  ValidatorRegex,
  ValidatorKeyField,
  ValidatorDatamodelSlug,
  ValidatorDatamodelDefinition,
  ValidatorLength,
  ValidatorBoundaries,
  ValidatorRequired,
};
