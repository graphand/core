import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";
import ValidatorTypes from "@/enums/validator-types";
import Function from "./Function";
import Job from "./Job";

@modelDecorator()
class Connector extends Model {
  static __name = "Connector";
  static isEnvironmentScoped = true;
  static allowMultipleOperations = false;
  static slug = "connectors" as const;
  static definition = {
    keyField: "slug",
    fields: {
      slug: { type: FieldTypes.TEXT },
      options: {
        type: FieldTypes.NESTED,
        options: { default: {} },
      },
      function: {
        type: FieldTypes.RELATION,
        options: {
          ref: Function.slug,
        },
      },
      source: { type: FieldTypes.TEXT },
      filter: { type: FieldTypes.NESTED },
      retryStrategy: {
        type: FieldTypes.NESTED,
        options: {
          default: {},
          fields: {
            maxRetries: { type: FieldTypes.NUMBER, options: { default: 3 } },
            initialDelay: { type: FieldTypes.NUMBER, options: { default: 1000 } },
            backoffFactor: { type: FieldTypes.NUMBER, options: { default: 2 } },
            strategyType: {
              type: FieldTypes.TEXT,
              options: {
                enum: ["fixed", "exponential", "exponentialWithJitter"],
                default: "exponential",
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
      { type: ValidatorTypes.REQUIRED, options: { field: "function" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "source" } },
    ],
  } satisfies ModelDefinition;
}

export default Connector;
