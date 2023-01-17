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

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldTextDefinition;

  @fieldDecorator(FieldTypes.JSON, {
    multiple: true,
    fields: {
      slug: {
        type: FieldTypes.TEXT,
        options: {},
      },
      type: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(FieldTypes),
        },
      },
      options: {
        type: FieldTypes.JSON,
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
  })
  validators: FieldJSONDefinition<ValidatorsDefinition>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  isPage: FieldBooleanDefinition;
}

export default DataModel;
