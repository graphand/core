import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import { ModelDefinition } from "../types";
import Job from "./Job";

@modelDecorator()
class Environment extends Model {
  static __name = "Environment";
  static slug = "environments";
  static definition: ModelDefinition = {
    keyField: "name",
    validators: [
      {
        type: ValidatorTypes.REGEX,
        options: { field: "name", pattern: "^(?!master$|main$).*$" },
      },
    ],
  };

  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.RELATION, { ref: Environment.slug })
  base: FieldDefinitionRelation<Environment>;

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default Environment;
