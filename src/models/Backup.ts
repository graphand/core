import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";
import Project from "./Project";

@modelDecorator()
class Backup extends Model {
  static __name = "Backup";

  static slug = "backups";
  static scope = ModelEnvScopes.GLOBAL;
  static controllersScope: "global" | "project" = "project";
  static allowMultipleOperations = false;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "_project" } },
  ];

  @fieldDecorator(FieldTypes.RELATION, { ref: Project.slug })
  _project: FieldDefinitionRelation<Project>;
}

export default Backup;
