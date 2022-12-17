import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import {
  FieldBooleanDefinition,
  FieldJSONDefinition,
  FieldRelationDefinition,
  FieldTextDefinition,
} from "../types";
import RuleActions from "../enums/rule-actions";

@modelDecorator()
class Role extends Model {
  static __name = "Role";
  static slug = "roles";
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldTextDefinition;

  @fieldDecorator(FieldTypes.BOOLEAN)
  admin: FieldBooleanDefinition;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "roles",
    multiple: false,
  })
  inherits: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;

  @fieldDecorator(FieldTypes.JSON, {
    multiple: true,
    fields: [
      {
        slug: "ref",
        type: FieldTypes.TEXT,
      },
      {
        slug: "actions",
        type: FieldTypes.TEXT,
        options: {
          multiple: true,
          options: Object.values(RuleActions),
        },
      },
      {
        slug: "conditions",
        type: FieldTypes.JSON,
      },
      {
        slug: "prohibition",
        type: FieldTypes.BOOLEAN,
      },
    ],
  })
  rules: FieldJSONDefinition<
    {
      ref: string;
      actions: string[];
      conditions: object;
      prohibition: boolean;
    }[]
  >;
}

export default Role;
