import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import {
  FieldDateDefinition,
  FieldRelationDefinition,
  FieldTextDefinition,
} from "../types";
import Role from "./Role";

@modelDecorator()
class Token extends Model {
  static __name = "Token";
  static slug = "tokens";
  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.DATE)
  expiration: FieldDateDefinition;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "roles",
    multiple: false,
  })
  inherits: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;
}

export default Token;
