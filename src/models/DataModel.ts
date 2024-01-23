import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";
  static slug = "datamodels" as const;
  static definition = {
    keyField: "slug",
    fields: {
      name: { type: FieldTypes.TEXT },
      slug: { type: FieldTypes.TEXT },
      definition: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            fields: {
              type: FieldTypes.NESTED,
              options: {
                defaultField: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      type: {
                        type: FieldTypes.TEXT,
                        options: {
                          options: Object.values(FieldTypes),
                          strict: true,
                        },
                      },
                      options: {
                        type: FieldTypes.NESTED,
                      },
                    },
                    validators: [
                      {
                        type: ValidatorTypes.REQUIRED,
                        options: {
                          field: "type",
                        },
                      },
                    ],
                  },
                },
              },
            },
            validators: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      type: {
                        type: FieldTypes.TEXT,
                        options: {
                          options: Object.values(ValidatorTypes),
                          strict: true,
                        },
                      },
                      options: {
                        type: FieldTypes.NESTED,
                      },
                    },
                    validators: [
                      {
                        type: ValidatorTypes.REQUIRED,
                        options: {
                          field: "type",
                        },
                      },
                    ],
                  },
                },
              },
            },
            single: {
              type: FieldTypes.BOOLEAN,
              options: {
                default: false,
              },
            },
            keyField: {
              type: FieldTypes.TEXT,
            },
          },
        },
      },
      _doc: { type: FieldTypes.NESTED },
    } as const,
    validators: [
      { type: ValidatorTypes.DATAMODEL_SLUG },
      { type: ValidatorTypes.DATAMODEL_DEFINITION },
    ],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.ENV;
}

export default DataModel;
