import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";
import { fieldDecorator } from "../lib/fieldDecorator";
import FieldTypes from "../enums/field-types";
import { AdapterFetcher, HookPhase, ModelDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Sockethook extends Model {
  static __name = "Sockethook";
  static slug = "sockethooks";
  static definition: ModelDefinition = {
    keyField: "name",
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "on" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "phase" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "action" } },
      {
        type: ValidatorTypes.BOUNDARIES,
        options: { field: "order", min: 0 },
      },
    ],
  };

  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  on: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT, {
    options: ["before", "after"],
    strict: true,
  })
  phase: HookPhase;

  @fieldDecorator(FieldTypes.TEXT, {
    options: [
      "count",
      "get",
      "getList",
      "createOne",
      "createMultiple",
      "updateOne",
      "updateMultiple",
      "deleteOne",
      "deleteMultiple",
      "initialize",
    ],
    strict: true,
  })
  action: keyof AdapterFetcher;

  @fieldDecorator(FieldTypes.BOOLEAN)
  blocking: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.NUMBER, { default: 0 })
  order: FieldDefinitionNumber;
}

export default Sockethook;
