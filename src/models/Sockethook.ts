import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Sockethook extends Model {
  static __name = "Sockethook";
  static isEnvironmentScoped = true;
  static slug = "sockethooks" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: { type: FieldTypes.TEXT },
      on: { type: FieldTypes.TEXT },
      phase: {
        type: FieldTypes.TEXT,
        options: {
          options: ["before", "after"],
          strict: true,
        },
      },
      action: {
        type: FieldTypes.TEXT,
        options: {
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
        },
      },
      blocking: { type: FieldTypes.BOOLEAN },
      order: { type: FieldTypes.NUMBER, options: { default: 0 } },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "on" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "phase" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "action" } },
      {
        type: ValidatorTypes.BOUNDARIES,
        options: { field: "order", min: 0 },
      },
    ],
  } satisfies ModelDefinition;
}

export default Sockethook;
