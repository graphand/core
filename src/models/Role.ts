import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldsRestriction, Rule, ValidatorsDefinition } from "../types";
import RuleActions from "../enums/rule-actions";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Role extends Model {
  static __name = "Role";

  static slug = "roles";
  static scope = ModelEnvScopes.ENV;
  static configKey = "slug";
  static validators: ValidatorsDefinition = [
    {
      type: ValidatorTypes.REGEX,
      options: { field: "slug", pattern: "^[a-zA-Z0-9_\\-]+$" },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.BOOLEAN)
  admin: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
      type: FieldTypes.RELATION,
      options: {
        ref: "roles",
      },
    },
  })
  inherits: FieldDefinitionArray<{
    type: FieldTypes.RELATION;
    definition: Role;
  }>;

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
      type: FieldTypes.NESTED,
      options: {
        fields: {
          ref: {
            type: FieldTypes.TEXT,
          },
          actions: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
                options: {
                  options: Object.values(RuleActions),
                  strict: true,
                },
              },
            },
          },
          filter: {
            type: FieldTypes.NESTED,
          },
          prohibition: {
            type: FieldTypes.BOOLEAN,
          },
        },
      },
    },
  })
  rules: FieldDefinitionArray<{
    type: FieldTypes.NESTED;
    definition: Rule;
  }>;

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
      type: FieldTypes.NESTED,
      options: {
        fields: {
          ref: {
            type: FieldTypes.TEXT,
          },
          actions: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
                options: {
                  options: Object.values(RuleActions),
                  strict: true,
                },
              },
            },
          },
          filter: {
            type: FieldTypes.NESTED,
          },
          fields: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
              },
            },
          },
        },
      },
    },
  })
  fieldsRestrictions: FieldDefinitionArray<{
    type: FieldTypes.NESTED;
    definition: FieldsRestriction;
  }>;

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
