import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";

const systemModels = [
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
  "users",
  "mergeRequests",
  "mergeRequestEvents",
  "settings",
];

class ValidatorDatamodelSlug extends Validator<ValidatorTypes.DATAMODEL_SLUG> {
  validate: Validator<ValidatorTypes.DATAMODEL_SLUG>["validate"] = async ({ list }) => {
    const values = list.map(i => i.get("slug")).filter(v => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const _isInvalid = (slug: string) => {
      return systemModels.includes(slug);
    };

    return !values.some(_isInvalid);
  };
}

export default ValidatorDatamodelSlug;
