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
  static keyField = "name";
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.DATE)
  expiration: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.NUMBER)
  maxGen: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.RELATION, { ref: Role.slug })
  role: FieldDefinitionRelation<Role>;

  @fieldDecorator(FieldTypes.NUMBER, { default: 0 })
  _generation: FieldDefinitionNumber;
}

export default Token;
