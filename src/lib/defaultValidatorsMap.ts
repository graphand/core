import Adapter from "./Adapter";
import Validator from "./Validator";
import ValidatorTypes from "../enums/validator-types";
import FieldTypes from "../enums/field-types";
import Model from "./Model";
import DataModel from "../models/DataModel";
import Patterns from "../enums/patterns";

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
];

class DefaultValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const path = this.getFullPath();
    const values = list.map((i) => i.get(path)).flat(Infinity);

    if (!values?.length) return true;

    return !values.some((v) => [null, undefined, ""].includes(v));
  }
}

class DefaultValidatorUnique extends Validator<ValidatorTypes.UNIQUE> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const path = this.getFullPath();
    const values = list
      .map((i) => i.get(path))
      .flat(Infinity)
      .filter((v) => ![null, undefined, ""].includes(v));

    if (!values?.length) {
      return true;
    }

    const valueSet = new Set();
    const hasTwice = values.some((v) => {
      if (valueSet.has(v)) {
        return true;
      }

      valueSet.add(v);
      return false;
    });

    if (hasTwice) {
      return false;
    }

    return true;
  }
}

class DefaultValidatorRegex extends Validator<ValidatorTypes.REGEX> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const path = this.getFullPath();
    const values = list
      .map((i) => i.get(path))
      .flat(Infinity)
      .filter((v) => ![null, undefined, ""].includes(v));

    if (!values?.length) return true;

    const regex = new RegExp(
      this.options.pattern,
      this.options.options?.join("")
    );

    return !values.some((v) => !regex.test(v));
  }
}

class DefaultValidatorKeyField extends Validator<ValidatorTypes.KEY_FIELD> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const adapter = ctx.model?.getAdapter();
    const validatorsMap = adapter?.validatorsMap ?? {};

    const _getValidator = <T extends ValidatorTypes>(
      type: T
    ): typeof Validator<T> => {
      let v = validatorsMap[type];
      if (v === undefined) {
        v = defaultValidatorsMap[type];
      }

      return v || Validator;
    };

    const ValidatorRegex = _getValidator(ValidatorTypes.REGEX);
    const validatorRegex = new ValidatorRegex(
      {
        type: ValidatorTypes.REGEX,
        options: { field: this.options.field, pattern: Patterns.SLUG },
      },
      this.path
    );

    const ValidatorRequired = _getValidator(ValidatorTypes.REQUIRED);
    const validatorRequired = new ValidatorRequired(
      {
        type: ValidatorTypes.REQUIRED,
        options: { field: this.options.field },
      },
      this.path
    );

    const ValidatorUnique = _getValidator(ValidatorTypes.UNIQUE);
    const validatorUnique = new ValidatorUnique(
      {
        type: ValidatorTypes.UNIQUE,
        options: { field: this.options.field },
      },
      this.path
    );

    const validates = await Promise.all([
      validatorRegex.validate(list, ctx),
      validatorRequired.validate(list, ctx),
      validatorUnique.validate(list, ctx),
    ]);

    return validates.every(Boolean);
  }
}

class DefaultValidatorDatamodelKeyField extends Validator<ValidatorTypes.DATAMODEL_KEY_FIELD> {
  async validate(list: Array<DataModel>, ctx: TransactionCtx = {}) {
    const _isInvalid = (i: DataModel) => {
      const keyField = i.get("keyField");

      if (!keyField) {
        return false;
      }

      const fields = i.get("fields");

      if (!fields) {
        return true;
      }

      const keyFieldField = fields[keyField];

      if (!keyFieldField) {
        return true;
      }

      if (keyFieldField.type !== FieldTypes.TEXT) {
        return true;
      }

      if (keyFieldField.options?.default) {
        return true;
      }

      return false;
    };

    return !list.some(_isInvalid);
  }
}

class DefaultValidatorLength extends Validator<ValidatorTypes.LENGTH> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const path = this.getFullPath();
    const values = list
      .map((i) => i.get(path))
      .flat(Infinity)
      .filter((v) => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const { min, max } = this.options;

    return !values.some((v) => {
      let length = v?.length ?? 0;

      if (typeof v === "number") {
        length = String(v).length;
      }

      return length < min || length > max;
    });
  }
}

class DefaultValidatorBoundaries extends Validator<ValidatorTypes.BOUNDARIES> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const path = this.getFullPath();
    const values = list
      .map((i) => i.get(path))
      .flat(Infinity)
      .filter((v) => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const { min, max } = this.options;

    return !values.some((v) => {
      const num = parseFloat(v);

      return num < min || num > max;
    });
  }
}

class DefaultValidatorDatamodelSlug extends Validator<ValidatorTypes.DATAMODEL_SLUG> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const values = list
      .map((i) => i.get("slug"))
      .filter((v) => ![null, undefined].includes(v));

    if (!values?.length) return true;

    const _isInvalid = (slug: string) => {
      return systemModels.includes(slug);
    };

    return !values.some(_isInvalid);
  }
}

class DefaultValidatorDatamodelFields extends Validator<ValidatorTypes.DATAMODEL_FIELDS> {
  async validate(list: Array<Model>, ctx: TransactionCtx = {}) {
    const _isInvalid = (i: DataModel) => {
      const fields = i.get("fields");

      if (!fields) {
        return false;
      }

      const keys = Object.keys(fields);

      const regex = new RegExp(Patterns.SLUG);
      for (const key of keys) {
        if (!regex.test(key)) {
          return true;
        }
      }

      return false;
    };

    return !list.some(_isInvalid);
  }
}

const defaultValidatorsMap: Adapter["validatorsMap"] = {
  [ValidatorTypes.REQUIRED]: DefaultValidatorRequired,
  [ValidatorTypes.UNIQUE]: DefaultValidatorUnique,
  [ValidatorTypes.REGEX]: DefaultValidatorRegex,
  [ValidatorTypes.KEY_FIELD]: DefaultValidatorKeyField,
  [ValidatorTypes.DATAMODEL_KEY_FIELD]: DefaultValidatorDatamodelKeyField,
  [ValidatorTypes.DATAMODEL_SLUG]: DefaultValidatorDatamodelSlug,
  [ValidatorTypes.DATAMODEL_FIELDS]: DefaultValidatorDatamodelFields,
  [ValidatorTypes.LENGTH]: DefaultValidatorLength,
  [ValidatorTypes.BOUNDARIES]: DefaultValidatorBoundaries,
};

export default defaultValidatorsMap;
