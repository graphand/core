import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ModelDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";
import Project from "./Project";
import Job from "./Job";

@modelDecorator()
class Backup extends Model {
  static __name = "Backup";
  static slug = "backups";
  static definition: ModelDefinition = {
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "_project" } }, // TODO: remove from core -> server only
      { type: ValidatorTypes.REQUIRED, options: { field: "_expireAt" } }, // TODO: remove from core -> server only
    ],
  };

  static scope = ModelEnvScopes.GLOBAL;
  static controllersScope: typeof Model["controllersScope"] = "project";
  static allowMultipleOperations = false;

  @fieldDecorator(FieldTypes.RELATION, { ref: Project.slug })
  _project: FieldDefinitionRelation<Project>;

  @fieldDecorator(FieldTypes.DATE)
  _expireAt: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default Backup;
