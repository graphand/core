import ValidatorTypes from "@/enums/validator-types";
import { ModelInstance } from "@/types";
import type DataModel from "@/models/DataModel";
import Validator from "@/lib/Validator";
import Adapter from "../Adapter";

class ValidatorDatamodelSlug extends Validator<ValidatorTypes.DATAMODEL_SLUG> {
  validate: Validator<ValidatorTypes.DATAMODEL_SLUG>["validate"] = async ({ list, model }) => {
    const modelsMap =
      model?.getAdapter(false)?.base.getRecursiveModelsMap() || Adapter.getRecursiveModelsMap();

    const _list = list as Array<ModelInstance<typeof DataModel>>;
    const values = _list.map(i => i.get("slug")).filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const _isInvalid = (slug: string) => {
      if (!modelsMap.has(slug)) {
        return false;
      }

      return !modelsMap.get(slug).extensible;
    };

    return !values.some(_isInvalid);
  };
}

export default ValidatorDatamodelSlug;
