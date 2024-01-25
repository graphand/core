import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import DataModel from "@/models/DataModel";
import { ModelInstance } from "@/types";
import { isValidDefinition } from "@/lib/utils";

class ValidatorDatamodelDefinition extends Validator<ValidatorTypes.DATAMODEL_DEFINITION> {
  validate: Validator<ValidatorTypes.DATAMODEL_DEFINITION>["validate"] = async ({ list }) => {
    return !list.some((m: ModelInstance<typeof DataModel>) => !isValidDefinition(m.definition));
  };
}

export default ValidatorDatamodelDefinition;
