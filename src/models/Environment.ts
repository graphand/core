import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../types";
import EnvironmentStatus from "../enums/environment-status";

const optionStatuses = Object.values(EnvironmentStatus) as [
  "ready",
  "loading",
  "error"
];

@modelDecorator()
class Environment extends Model {
  static __name = "Environment";
  static slug = "environments";
  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT, {
    options: optionStatuses,
  })
  status: FieldTextDefinition<{ options: typeof optionStatuses }>;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "environments",
    multiple: false,
  })
  inherits: FieldRelationDefinition<{
    model: Environment;
    multiple: false;
  }>;
}

export default Environment;
