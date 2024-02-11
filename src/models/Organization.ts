import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import Terms from "@/models/Terms";
import { ModelDefinition } from "@/types";
import Account from "./Account";

@modelDecorator()
class Organization extends Model {
  static __name = "Organization";
  static isSystem = true;
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
          ref: Account.slug,
        },
      },
      _accounts: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.RELATION,
            options: {
              ref: Account.slug,
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
            account: {
              type: FieldTypes.RELATION,
              options: {
                ref: Account.slug,
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
