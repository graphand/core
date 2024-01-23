import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelInstance } from "@/types";
import RuleActions from "@/enums/rule-actions";
import ValidatorTypes from "@/enums/validator-types";
import Patterns from "@/enums/patterns";
import { ModelDefinition } from "@/types";

type Rule = ModelInstance<typeof Role>["rules"][number];
type FieldRestriction = ModelInstance<typeof Role>["fieldsRestrictions"][number];

@modelDecorator()
class Role extends Model {
  static __name = "Role";
  static slug = "roles" as const;
  static definition = {
    keyField: "slug",
    fields: {
      slug: { type: FieldTypes.TEXT },
      _admin: {
        type: FieldTypes.BOOLEAN,
      },
      inherits: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.RELATION,
            options: {
              ref: Role.slug,
            },
          },
        },
      },
      systemNotifications: { type: FieldTypes.BOOLEAN },
      rules: {
        type: FieldTypes.ARRAY,
        options: {
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
        },
      },
      fieldsRestrictions: {
        type: FieldTypes.ARRAY,
        options: {
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
        },
      },
    },
    validators: [
      {
        type: ValidatorTypes.REGEX,
        options: { field: "slug", pattern: Patterns.SLUG },
      },
    ],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.ENV;

  async getRulesInherited(): Promise<Array<Rule>> {
    const i = this as ModelInstance<typeof Role>;
    let rules = i.rules || [];

    const inheritedRoles = await i.inherits;

    if (inheritedRoles) {
      const rolesRules = await Promise.all(inheritedRoles.map(role => role.getRulesInherited()));

      rules = [...rules, ...rolesRules.flat()];
    }

    return rules;
  }

  async getFieldsRestrictionsInherited(): Promise<Array<FieldRestriction>> {
    const i = this as ModelInstance<typeof Role>;
    let fieldsRestrictions = i.fieldsRestrictions || [];

    const inheritedRoles = await i.inherits;

    if (inheritedRoles) {
      const rolesFieldsRestrictions = await Promise.all(
        inheritedRoles.map(role => role.getFieldsRestrictionsInherited()),
      );

      fieldsRestrictions = [...fieldsRestrictions, ...rolesFieldsRestrictions.flat()];
    }

    return fieldsRestrictions;
  }
}

export default Role;
