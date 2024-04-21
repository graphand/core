import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";
import Function from "./Function";

const functionRelationField = {
  type: FieldTypes.ARRAY,
  options: {
    items: {
      type: FieldTypes.NESTED,
      options: {
        strict: true,
        fields: {
          function: {
            type: FieldTypes.RELATION,
            options: {
              ref: Function.slug,
            },
          },
          runInJob: {
            type: FieldTypes.BOOLEAN,
            options: {
              default: false,
            },
          },
          handleErrors: {
            type: FieldTypes.BOOLEAN,
            options: {
              default: false,
            },
          },
        },
      },
    },
  },
} as const;

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";
  static isEnvironmentScoped = true;
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
                          enum: Object.values(FieldTypes),
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
                          enum: Object.values(ValidatorTypes),
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
        _ts: undefined as ModelDefinition,
      },
      hooks: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            "before.createOne": functionRelationField,
            "after.createOne": functionRelationField,
            "before.createMultiple": functionRelationField,
            "after.createMultiple": functionRelationField,
            "before.updateOne": functionRelationField,
            "after.updateOne": functionRelationField,
            "before.updateMultiple": functionRelationField,
            "after.updateMultiple": functionRelationField,
            "before.deleteOne": functionRelationField,
            "after.deleteOne": functionRelationField,
            "before.deleteMultiple": functionRelationField,
            "after.deleteMultiple": functionRelationField,
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
}

export default DataModel;
