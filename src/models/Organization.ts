import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import User from "@/models/User";
import ValidatorTypes from "@/enums/validator-types";
import Terms from "@/models/Terms";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Organization extends Model {
  static __name = "Organization";
  static scope = ModelEnvScopes.GLOBAL;
  static allowMultipleOperations = false;
  static slug = "organizations" as const;
  static definition = {
    keyField: "slug",
    fields: {
      name: { type: FieldTypes.TEXT },
      slug: { type: FieldTypes.TEXT },
      owner: {
        type: FieldTypes.RELATION,
        options: {
          ref: User.slug,
        },
      },
      _users: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.RELATION,
            options: {
              ref: User.slug,
            },
          },
        },
      },
      _consent: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            terms: {
              type: FieldTypes.RELATION,
              options: {
                ref: Terms.slug,
              },
            },
            user: {
              type: FieldTypes.RELATION,
              options: {
                ref: User.slug,
              },
            },
          },
        },
      },
    },
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "name" } }],
  } satisfies ModelDefinition;
}

export default Organization;
