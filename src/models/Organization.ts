import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ValidatorsDefinition } from "../types";
import User from "./User";
import ValidatorTypes from "../enums/validator-types";
import Terms from "./Terms";

@modelDecorator()
class Organization extends Model {
  static __name = "Organization";

  static slug = "organizations";
  static scope = ModelEnvScopes.GLOBAL;
  static keyField = "slug";
  static allowMultipleOperations = false;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.RELATION, { ref: User.slug })
  owner: FieldDefinitionRelation<User>;

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
      type: FieldTypes.RELATION,
      options: {
        ref: User.slug,
      },
    },
  })
  _users: FieldDefinitionArray<{
    type: FieldTypes.RELATION;
    options: {
      model: User;
    };
  }>;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      terms: { type: FieldTypes.RELATION, options: { ref: Terms.slug } },
      user: { type: FieldTypes.RELATION, options: { ref: User.slug } },
    },
  })
  _consent: FieldDefinitionNested<{
    terms: FieldDefinitionRelation<Terms>;
    user: FieldDefinitionRelation<User>;
  }>;
}

export default Organization;
