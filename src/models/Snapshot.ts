import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";
import Job from "./Job";

@modelDecorator()
class Snapshot extends Model {
  static __name = "Snapshot";
  static allowMultipleOperations = false;
  static slug = "snapshots" as const;
  static definition = {
    fields: {
      _expireAt: {
        type: FieldTypes.DATE,
      },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
    },
  } satisfies ModelDefinition;
}

export default Snapshot;
