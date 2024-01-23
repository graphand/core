import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import Project from "@/models/Project";
import Job from "@/models/Job";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Backup extends Model {
  static __name = "Backup";
  static slug = "backups" as const;
  static definition = {
    fields: {
      _project: {
        type: FieldTypes.RELATION,
        options: {
          ref: Project.slug,
        },
      },
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
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "_project" } }, // TODO: remove from core -> server only
      { type: ValidatorTypes.REQUIRED, options: { field: "_expireAt" } }, // TODO: remove from core -> server only
    ],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.GLOBAL;
  static controllersScope: typeof Model["controllersScope"] = "project";
  static allowMultipleOperations = false;
}

export default Backup;
