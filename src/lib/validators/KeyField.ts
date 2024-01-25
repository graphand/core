import ValidatorTypes from "@/enums/validator-types";
import Validator from "@/lib/Validator";
import defaultValidatorsMap from "../defaultValidatorsMap";
import Patterns from "@/enums/patterns";

class ValidatorKeyField extends Validator<ValidatorTypes.KEY_FIELD> {
  validate: Validator<ValidatorTypes.KEY_FIELD>["validate"] = async opts => {
    const { model } = opts;
    const adapter = model?.getAdapter();
    const validatorsMap = adapter?.validatorsMap ?? {};

    const _getValidator = <T extends ValidatorTypes>(type: T): typeof Validator<T> => {
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
      this.path,
    );

    const ValidatorRequired = _getValidator(ValidatorTypes.REQUIRED);
    const validatorRequired = new ValidatorRequired(
      {
        type: ValidatorTypes.REQUIRED,
        options: { field: this.options.field },
      },
      this.path,
    );

    const ValidatorUnique = _getValidator(ValidatorTypes.UNIQUE);
    const validatorUnique = new ValidatorUnique(
      {
        type: ValidatorTypes.UNIQUE,
        options: { field: this.options.field },
      },
      this.path,
    );

    const validates = await Promise.all([
      validatorRegex.validate(opts),
      validatorRequired.validate(opts),
      validatorUnique.validate(opts),
    ]);

    return validates.every(Boolean);
  };
}

export default ValidatorKeyField;
