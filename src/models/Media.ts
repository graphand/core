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
    { type: ValidatorTypes.REQUIRED, options: { field: "mimetype" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "originalname" } },
    { type: ValidatorTypes.BOUNDARIES, options: { field: "size", min: 1 } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  mimetype: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  originalname: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NUMBER)
  size: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: false })
  private: FieldDefinitionBoolean;

  file: any;
}

export default Media;
