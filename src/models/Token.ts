import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import Role from "./Role";
import { ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Token extends Model {
  static __name = "Token";

  static slug = "tokens";
  static scope = ModelEnvScopes.PROJECT;
  static configKey = "name";
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.DATE)
  expiration: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "roles",
    multiple: false,
  })
  role: FieldDefinitionRelation<{
    model: Role;
    multiple: false;
  }>;
}

export default Token;
