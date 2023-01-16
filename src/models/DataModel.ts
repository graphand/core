import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import { FieldDefinition, ValidatorDefinition } from "../types";
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
    fields: [
      {
        slug: "slug",
        type: FieldTypes.TEXT,
      },
      {
        slug: "type",
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(FieldTypes),
        },
      },
      {
        slug: "options",
        type: FieldTypes.JSON,
      },
    ],
  })
  fields: FieldJSONDefinition<FieldDefinition[]>;

  @fieldDecorator(FieldTypes.JSON, {
    multiple: true,
    fields: [
      {
        slug: "type",
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(ValidatorTypes),
        },
      },
      {
        slug: "options",
        type: FieldTypes.JSON,
      },
    ],
  })
  validators: FieldJSONDefinition<ValidatorDefinition[]>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  isPage: FieldBooleanDefinition;
}

export default DataModel;
