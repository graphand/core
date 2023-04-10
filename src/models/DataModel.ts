import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import {
  FieldsDefinition,
  ValidatorDefinition,
  ValidatorsDefinition,
} from "../types";
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
      options: { field: "slug", pattern: "^[a-zA-Z][a-zA-Z0-9]+?$" },
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

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
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
  validators: FieldDefinitionArray<{
    type: FieldTypes.JSON;
    definition: ValidatorDefinition;
  }>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  isPage: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.TEXT)
  configKey: FieldDefinitionText;

  @fieldDecorator(FieldTypes.JSON)
  _page: FieldDefinitionJSON;
}

export default DataModel;
