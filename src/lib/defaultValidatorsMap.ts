import Adapter from "./Adapter";
import Validator from "./Validator";
import ValidatorTypes from "../enums/validator-types";
import FieldTypes from "../enums/field-types";

class DefaultValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
  async validate(data) {
    let values;
    if (this.options.field) {
      values = data.map((i) => i[this.options.field]);
    } else {
      values = data;
    }

    if (!values?.length) return true;

    return !values.some((v) => [null, undefined, ""].includes(v));
  }
}

class DefaultValidatorUnique extends Validator<ValidatorTypes.UNIQUE> {
  async validate(data, ctx) {
    let values;
    if (this.options.field) {
      values = data.map((i) => i[this.options.field]);
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

    let values;
    if (this.options.field) {
      values = data
        .map((i) => i[this.options.field])
        .filter((v) => v !== undefined && v !== null);
    } else {
      values = data;
    }

    if (!values?.length) return true;

    return !values.some((v) => !regex.test(v));
  }
}

class DefaultValidatorConfigKey extends Validator<ValidatorTypes.CONFIG_KEY> {
  async validate(data, ctx) {
    const adapter = ctx.model.getAdapter();
    const validatorsMap = adapter.validatorsMap ?? {};

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

    let values;
    if (this.options.field) {
      values = data.map((i) => i[this.options.field]);
    } else {
      values = data;
    }

    if (!values?.length) return true;

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
  async validate(data) {
    const { min, max } = this.options;

    let values;
    if (this.options.field) {
      values = data.map((i) => i[this.options.field]);
    } else {
      values = data;
    }

    if (!values?.length) return true;

    return !values.some((v) => {
      const num = parseFloat(v);

      return num < min || num > max;
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
