import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldsRestriction, Rule } from "../types";
import RuleActions from "../enums/rule-actions";
import {
  FieldBooleanDefinition,
  FieldJSONDefinition,
  FieldRelationDefinition,
  FieldTextDefinition,
} from "../fields";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Role extends Model {
  static __name = "Role";

  static slug = "roles";
  static scope = ModelEnvScopes.ENV;
  static configKey = "slug";
  static validators = [
    { type: ValidatorTypes.REQUIRED, options: { field: "slug" } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldTextDefinition;

  @fieldDecorator(FieldTypes.BOOLEAN)
  admin: FieldBooleanDefinition;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "roles",
    multiple: true,
  })
  inherits: FieldRelationDefinition<{
    model: Role;
    multiple: true;
  }>;

  @fieldDecorator(FieldTypes.JSON, {
    multiple: true,
    fields: {
      ref: {
        type: FieldTypes.TEXT,
      },
      actions: {
        type: FieldTypes.TEXT,
        options: {
          multiple: true,
          options: Object.values(RuleActions),
        },
      },
      filter: {
        type: FieldTypes.JSON,
      },
      prohibition: {
        type: FieldTypes.BOOLEAN,
      },
    },
  })
  rules: FieldJSONDefinition<Array<Rule>>;

  @fieldDecorator(FieldTypes.JSON, {
    multiple: true,
    fields: {
      ref: {
        type: FieldTypes.TEXT,
      },
      actions: {
        type: FieldTypes.TEXT,
        options: {
          multiple: true,
          options: Object.values(RuleActions),
        },
      },
      filter: {
        type: FieldTypes.JSON,
      },
      fields: {
        type: FieldTypes.TEXT,
        options: {
          multiple: true,
        },
      },
    },
  })
  fieldsRestrictions: FieldJSONDefinition<Array<FieldsRestriction>>;

  async getRulesInherited(): Promise<Array<Rule>> {
    let rules: Array<Rule> = this.rules || [];

    const inheritedRoles = await this.inherits;

    if (inheritedRoles) {
      const rolesRules = await Promise.all(
        inheritedRoles.map((role) => role.getRulesInherited())
      );

      rules = [...rules, ...rolesRules.flat()];
    }

    return rules;
  }

  async getFieldsRestrictionsInherited(): Promise<Array<FieldsRestriction>> {
    let fieldsRestrictions: Array<FieldsRestriction> =
      this.fieldsRestrictions || [];

    const inheritedRoles = await this.inherits;

    if (inheritedRoles) {
      const rolesFieldsRestrictions = await Promise.all(
        inheritedRoles.map((role) => role.getFieldsRestrictionsInherited())
      );

      fieldsRestrictions = [
        ...fieldsRestrictions,
        ...rolesFieldsRestrictions.flat(),
      ];
    }

    return fieldsRestrictions;
  }
}

export default Role;
