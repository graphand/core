import ValidatorTypes from "@/enums/validator-types";
import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";
import Job from "./Job";
import Key from "./Key";
import Role from "./Role";

@modelDecorator()
class Function extends Model {
  static __name = "Function";
  static isEnvironmentScoped = true;
  static allowMultipleOperations = false;
  static slug = "functions" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: { type: FieldTypes.TEXT },
      code: { type: FieldTypes.TEXT }, // base64 encoded function code
      keys: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.RELATION,
            options: {
              ref: Key.slug,
            },
          },
        },
      },
      role: {
        type: FieldTypes.RELATION,
        options: {
          ref: Role.slug,
        },
      },
      schedule: {
        type: FieldTypes.NESTED,
        options: {
          strict: true,
          default: {},
          fields: {
            enabled: {
              type: FieldTypes.BOOLEAN,
              options: {
                default: false,
              },
            },
            cronExpression: {
              type: FieldTypes.TEXT,
              options: {
                default: "0 0 * * *",
              },
            },
          },
        },
      },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
    },
    validators: [
      {
        type: ValidatorTypes.REQUIRED,
        options: {
          field: "code",
        },
      },
    ],
  } satisfies ModelDefinition;
}

export default Function;
