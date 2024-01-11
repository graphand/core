import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";
import ValidatorTypes from "../enums/validator-types";
import { ModelDefinition } from "../types";
import { fieldDecorator } from "../lib/fieldDecorator";
import FieldTypes from "../enums/field-types";

@modelDecorator()
class Media extends Model {
  static __name = "Media";
  static slug = "medias";
  static definition: ModelDefinition = {
    keyField: "name",
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "_mimetype" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "_originalname" } },
      { type: ValidatorTypes.BOUNDARIES, options: { field: "_size", min: 1 } },
    ],
  };

  static searchable = true;
  static extensible = true;
  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  private: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.TEXT)
  _mimetype: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  _originalname: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NUMBER)
  _size: FieldDefinitionNumber;

  file: any;
}

export default Media;
