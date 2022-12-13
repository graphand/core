import Field from "../Field";
import Model from "../Model";
import FieldTypes from "../../enums/field-types";

class FieldText extends Field<FieldTypes.TEXT> {
  deserialize(value, from: Model) {
    if (!value) {
      return value;
    }

    if (this.options.multiple) {
      return typeof value === "string" ? [value] : value || [];
    }

    return Array.isArray(value) ? value[0] : value;
  }

  serialize(value) {
    if (!value) {
      return value;
    }

    if (this.options.multiple) {
      return value && !Array.isArray(value) ? [value] : value;
    }

    return value && Array.isArray(value) ? value[0] : value;
  }
}

type string_ = string & Partial<any>;

type FieldTextDefinitionSingleType<
  Options extends string[],
  Creatable extends boolean = true,
  DefaultType extends any = string_
> = Options extends string[]
  ? Creatable extends false
    ? Options[number]
    : FieldTextDefinitionSingleType<Options, false> | DefaultType
  : FieldTextDefinitionSingleType<[], Creatable, string>;

export type FieldTextDefinition<
  D extends {
    required?: boolean;
    options?: string[];
    multiple?: boolean;
    creatable?: boolean;
  } = { multiple: false; required: false; creatable: true },
  Required extends boolean = false
> = Required extends true
  ? D["multiple"] extends true
    ? FieldTextDefinitionSingleType<D["options"], D["creatable"]>[]
    : FieldTextDefinitionSingleType<D["options"], D["creatable"]>
  : D["required"] extends true
  ? FieldTextDefinition<D, true>
  : FieldTextDefinition<D, true> | undefined;

export default FieldText;
