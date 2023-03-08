import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../fields";
import { ValidatorsDefinition } from "../types";
import User from "./User";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Organization extends Model {
  static __name = "Organization";

  static slug = "organizations";
  static scope = ModelEnvScopes.GLOBAL;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "slug" } },
    { type: ValidatorTypes.UNIQUE, options: { field: "slug" } },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "slug", pattern: "^[a-zA-Z0-9_\\-]+$" },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldTextDefinition;

  @fieldDecorator(FieldTypes.RELATION, { ref: "users", multiple: true })
  users: FieldRelationDefinition<{
    model: User;
    multiple: true;
  }>;
}

export default Organization;
