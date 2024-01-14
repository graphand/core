import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Role from "@/models/Role";
import { ModelDefinition } from "@/types";
import ValidatorTypes from "@/enums/validator-types";

@modelDecorator()
class Token extends Model {
  static __name = "Token";
  static slug = "tokens";
  static definition: ModelDefinition = {
    keyField: "name",
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "role" } }],
  };

  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.DATE)
  expiration: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.NUMBER)
  lifetime: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.NUMBER)
  maxGen: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.RELATION, { ref: Role.slug })
  role: FieldDefinitionRelation<Role>;

  @fieldDecorator(FieldTypes.NUMBER, { default: 0 })
  _generation: FieldDefinitionNumber;
}

export default Token;
