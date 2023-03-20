import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import { FieldsDefinition, ValidatorsDefinition } from "../types";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";

  static slug = "datamodels";
  static scope = ModelEnvScopes.ENV;
  static configKey = "slug";
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.DATAMODEL_CONFIG_KEY },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "slug", pattern: "^[a-zA-Z0-9_\\-]+$" },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

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
  fields: FieldDefinitionJSON<FieldsDefinition>;

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
  validators: FieldDefinitionJSON<ValidatorsDefinition>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  isPage: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.TEXT)
  configKey: FieldDefinitionText;
}

export default DataModel;
