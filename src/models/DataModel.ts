import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import {
  FieldDefinition,
  FieldJSONDefinition,
  FieldTextDefinition,
} from "../types";
import FieldTypes from "../enums/field-types";

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
          multiple: true,
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
}

export default DataModel;
