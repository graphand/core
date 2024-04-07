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
      type: FieldTypes.RELATION,
      options: {
        ref: Function.slug,
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
            "before.createOne.error": functionRelationField,
            "after.createOne": functionRelationField,
            "after.createOne.error": functionRelationField,
            "before.createMultiple": functionRelationField,
            "before.createMultiple.error": functionRelationField,
            "after.createMultiple": functionRelationField,
            "after.createMultiple.error": functionRelationField,
            "before.updateOne": functionRelationField,
            "before.updateOne.error": functionRelationField,
            "after.updateOne": functionRelationField,
            "after.updateOne.error": functionRelationField,
            "before.updateMultiple": functionRelationField,
            "before.updateMultiple.error": functionRelationField,
            "after.updateMultiple": functionRelationField,
            "after.updateMultiple.error": functionRelationField,
            "before.deleteOne": functionRelationField,
            "before.deleteOne.error": functionRelationField,
            "after.deleteOne": functionRelationField,
            "after.deleteOne.error": functionRelationField,
            "before.deleteMultiple": functionRelationField,
            "before.deleteMultiple.error": functionRelationField,
            "after.deleteMultiple": functionRelationField,
            "after.deleteMultiple.error": functionRelationField,
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
