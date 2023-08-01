import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";
import ValidatorTypes from "../enums/validator-types";
import { ValidatorsDefinition } from "../types";
import { fieldDecorator } from "../lib/fieldDecorator";
import FieldTypes from "../enums/field-types";

@modelDecorator()
class Media extends Model {
  static __name = "Media";

  static extendable = true;
  static slug = "medias";
  static scope = ModelEnvScopes.PROJECT;
  static keyField = "name";
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "_mimetype" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "_originalname" } },
    { type: ValidatorTypes.BOUNDARIES, options: { field: "_size", min: 1 } },
  ];

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
