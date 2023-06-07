import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";
import { fieldDecorator } from "../lib/fieldDecorator";
import FieldTypes from "../enums/field-types";
import { AdapterFetcher, HookPhase, ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Sockethook extends Model {
  static __name = "Sockethook";

  static extendable = false;
  static slug = "sockethooks";
  static scope = ModelEnvScopes.ENV;
  static keyField = "name";
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "on" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "phase" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "action" } },
    {
      type: ValidatorTypes.BOUNDARIES,
      options: { field: "order", min: 0 },
    },
  ];

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
