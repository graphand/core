import Adapter from "./Adapter";
import Validator from "./Validator";
import ValidatorTypes from "../enums/validator-types";
import FieldTypes from "../enums/field-types";
import CoreError from "./CoreError";

class DefaultValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
  async validate(data) {
    const invalid = data.find((i) =>
      [null, undefined, ""].includes(i[this.options.field])
    );

    return !invalid;
  }
}

class DefaultValidatorUnique extends Validator<ValidatorTypes.UNIQUE> {
  async validate(data, ctx) {
    let values;
    if (this.options.field) {
      values = data
        .map((i) => i[this.options.field])
        .filter((v) => v !== undefined);
    } else {
      values = data;
    }

    if (!values?.length) return true;

    const hasTwice = values.some(
      (v, i) => values.indexOf(v) !== i || values.lastIndexOf(v) !== i
    );

    if (hasTwice) {
      return false;
    }

    return true;
  }
}

class DefaultValidatorRegex extends Validator<ValidatorTypes.REGEX> {
  async validate(data) {
    const regex = new RegExp(
      this.options.pattern,
      this.options.options?.join("")
    );

    return !data.some((i) => {
      const v = i[this.options.field];
      return v !== undefined && v !== null && !regex.test(v);
    });
  }
}

class DefaultValidatorConfigKey extends Validator<ValidatorTypes.CONFIG_KEY> {
  async validate(data, ctx) {
    const validatorsMap = ctx.model.__adapter.validatorsMap ?? {};

    const _getValidator = <T extends ValidatorTypes>(
      type: T
    ): typeof Validator<T> => {
      let v = validatorsMap[type];
      if (v === undefined) {
        v = defaultValidatorsMap[type];
      }

      return v || Validator;
    };

    const ValidatorRequired = _getValidator(ValidatorTypes.REQUIRED);
    const validatorRequired = new ValidatorRequired(
      {
        type: ValidatorTypes.REQUIRED,
        options: { field: this.options.field },
      },
      this.__path
    );

    const ValidatorUnique = _getValidator(ValidatorTypes.UNIQUE);
    const validatorUnique = new ValidatorUnique(
      {
        type: ValidatorTypes.UNIQUE,
        options: { field: this.options.field },
      },
      this.__path
    );

    const validates = await Promise.all([
      validatorRequired.validate(data, ctx),
      validatorUnique.validate(data, ctx),
    ]);

    return validates.every(Boolean);
  }
}

class DefaultValidatorDatamodelConfigKey extends Validator<ValidatorTypes.DATAMODEL_CONFIG_KEY> {
  async validate(data, ctx) {
    return data.every((i) => {
      const configKey = i?.configKey;

      if (!configKey) {
        return true;
      }

      if (!i.fields?.[configKey]) {
        return false;
      }

      const configKeyField = i.fields[configKey];

      if (configKeyField.type !== FieldTypes.TEXT) {
        return false;
      }

      if (configKeyField.options?.default) {
        return false;
      }

      return true;
    });
  }
}

class DefaultValidatorLength extends Validator<ValidatorTypes.LENGTH> {
  async validate(data) {
    const { min, max } = this.options;

    return data.every((i) => {
      const v = i[this.options.field];

      if (v === undefined || v === null) {
        return true;
      }

      let length = v?.length ?? 0;

      if (typeof v === "number") {
        length = String(v).length;
      }

      return length >= min && length <= max;
    });
  }
}

class DefaultValidatorBoundaries extends Validator<ValidatorTypes.BOUNDARIES> {
  async validate(data) {
    const { min, max } = this.options;

    return data.every((i) => {
      const v = i[this.options.field];

      if (v === undefined || v === null) {
        return true;
      }

      const num = parseFloat(v);

      return num >= min && num <= max;
    });
  }
}

const defaultValidatorsMap: Adapter["validatorsMap"] = {
  [ValidatorTypes.REQUIRED]: DefaultValidatorRequired,
  [ValidatorTypes.UNIQUE]: DefaultValidatorUnique,
  [ValidatorTypes.REGEX]: DefaultValidatorRegex,
  [ValidatorTypes.CONFIG_KEY]: DefaultValidatorConfigKey,
  [ValidatorTypes.DATAMODEL_CONFIG_KEY]: DefaultValidatorDatamodelConfigKey,
  [ValidatorTypes.LENGTH]: DefaultValidatorLength,
  [ValidatorTypes.BOUNDARIES]: DefaultValidatorBoundaries,
};

export default defaultValidatorsMap;
