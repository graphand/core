import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import ValidatorTypes from "@/enums/validator-types";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Media extends Model {
  static __name = "Media";
  static searchable = true;
  static extensible = true;
  static scope = ModelEnvScopes.PROJECT;
  static slug = "medias" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: { type: FieldTypes.TEXT },
      private: { type: FieldTypes.BOOLEAN, options: { default: false } },
      _mimetype: { type: FieldTypes.TEXT },
      _originalname: { type: FieldTypes.TEXT },
      _size: { type: FieldTypes.NUMBER },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "_mimetype" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "_originalname" } },
      { type: ValidatorTypes.BOUNDARIES, options: { field: "_size", min: 1 } },
    ],
  } satisfies ModelDefinition;
}

export default Media;
