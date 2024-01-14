import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import { ModelDefinition } from "@/types";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";
  static slug = "datamodels";
  static definition: ModelDefinition = {
    keyField: "slug",
    validators: [
      { type: ValidatorTypes.DATAMODEL_SLUG },
      { type: ValidatorTypes.DATAMODEL_DEFINITION },
    ],
  };

  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED, {
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
  })
  definition: FieldDefinitionNested<ModelDefinition>;

  @fieldDecorator(FieldTypes.NESTED)
  _doc: FieldDefinitionNested; // The related document if single is true
}

export default DataModel;
