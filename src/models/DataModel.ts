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
import Patterns from "../enums/patterns";

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";

  static slug = "datamodels";
  static scope = ModelEnvScopes.ENV;
  static keyField = "slug";
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.DATAMODEL_KEY_FIELD },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "slug", pattern: Patterns.SLUG },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED, {
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
  })
  fields: FieldDefinitionNested<FieldsDefinition>;

  @fieldDecorator(FieldTypes.ARRAY, {
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
  })
  validators: FieldDefinitionArray<{
    type: FieldTypes.NESTED;
    definition: ValidatorDefinition;
  }>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  single: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.TEXT)
  keyField: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED)
  _doc: FieldDefinitionNested; // The related document if single is true
}

export default DataModel;
