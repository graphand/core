import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import { FieldsDefinition, ValidatorsDefinition } from "../types";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import {
  FieldBooleanDefinition,
  FieldJSONDefinition,
  FieldTextDefinition,
} from "../fields";

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";

  static slug = "datamodels";
  static scope = ModelEnvScopes.ENV;
  static validators = [
    {
      type: ValidatorTypes.REQUIRED,
      options: {
        field: "slug",
      },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldTextDefinition;

  @fieldDecorator(FieldTypes.JSON, {
    defaultField: {
      type: FieldTypes.JSON,
      options: {
        fields: {
          type: {
            type: FieldTypes.TEXT,
            options: {
              options: Object.values(ValidatorTypes),
            },
          },
          options: {
            type: FieldTypes.JSON,
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
  })
  fields: FieldJSONDefinition<FieldsDefinition>;

  @fieldDecorator(FieldTypes.JSON, {
    multiple: true,
    fields: {
      type: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(ValidatorTypes),
        },
      },
      options: {
        type: FieldTypes.JSON,
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
  })
  validators: FieldJSONDefinition<ValidatorsDefinition>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  isPage: FieldBooleanDefinition;
}

export default DataModel;
