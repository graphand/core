import Adapter from "@/lib/Adapter";
import ValidatorTypes from "@/enums/validator-types";
import ValidatorUnique from "./validators/Unique";
import ValidatorRegex from "./validators/Regex";
import ValidatorKeyField from "./validators/KeyField";
import ValidatorDatamodelSlug from "./validators/DatamodelSlug";
import ValidatorDatamodelDefinition from "./validators/DatamodelDefinition";
import ValidatorLength from "./validators/Length";
import ValidatorBoundaries from "./validators/Boundaries";
import ValidatorRequired from "./validators/Required";

const defaultValidatorsMap: Adapter["validatorsMap"] = {
  [ValidatorTypes.REQUIRED]: ValidatorRequired,
  [ValidatorTypes.UNIQUE]: ValidatorUnique,
  [ValidatorTypes.REGEX]: ValidatorRegex,
  [ValidatorTypes.KEY_FIELD]: ValidatorKeyField,
  [ValidatorTypes.DATAMODEL_SLUG]: ValidatorDatamodelSlug,
  [ValidatorTypes.DATAMODEL_DEFINITION]: ValidatorDatamodelDefinition,
  [ValidatorTypes.LENGTH]: ValidatorLength,
  [ValidatorTypes.BOUNDARIES]: ValidatorBoundaries,
};

export default defaultValidatorsMap;
