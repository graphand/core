import ValidatorTypes from "@/enums/validator-types";
import { ModelInstance } from "@/types";
import type DataModel from "@/models/DataModel";
import Validator from "@/lib/Validator";

const coreModels = [
  "accounts_authProviders",
  "authProviders",
  "backups",
  "datamodels",
  "environments",
  "jobs",
  "keys",
  "organizations",
  "projects",
  "roles",
  "searchConfigs",
  "sockethooks",
  "terms",
  "tokens",
  "mergeRequests",
  "mergeRequestEvents",
  "settings",
  "invitations",
];

class ValidatorDatamodelSlug extends Validator<ValidatorTypes.DATAMODEL_SLUG> {
  validate: Validator<ValidatorTypes.DATAMODEL_SLUG>["validate"] = async ({ list }) => {
    const _list = list as Array<ModelInstance<typeof DataModel>>;
    const values = _list.map(i => i.get("slug")).filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const _isInvalid = (slug: string) => {
      return coreModels.includes(slug);
    };

    return !values.some(_isInvalid);
  };
}

export default ValidatorDatamodelSlug;
