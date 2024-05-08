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
            before_createOne: functionRelationField,
            after_createOne: functionRelationField,
            before_createMultiple: functionRelationField,
            after_createMultiple: functionRelationField,
            before_updateOne: functionRelationField,
            after_updateOne: functionRelationField,
            before_updateMultiple: functionRelationField,
            after_updateMultiple: functionRelationField,
            before_deleteOne: functionRelationField,
            after_deleteOne: functionRelationField,
            before_deleteMultiple: functionRelationField,
            after_deleteMultiple: functionRelationField,
          },
          validators: [
            { type: ValidatorTypes.LENGTH, options: { field: "before_createOne", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "after_createOne", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "before_createMultiple", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "after_createMultiple", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "before_updateOne", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "after_updateOne", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "before_updateMultiple", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "after_updateMultiple", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "before_deleteOne", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "after_deleteOne", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "before_deleteMultiple", max: 100 } },
            { type: ValidatorTypes.LENGTH, options: { field: "after_deleteMultiple", max: 100 } },
          ],
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
