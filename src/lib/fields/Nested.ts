import FieldTypes from "@/enums/field-types";
import { FieldSerializerInput } from "@/types";
import Field from "@/lib/Field";
import { getFieldFromDefinition, getNestedFieldsMap, getPathLevel } from "@/lib/utils";

class FieldNested extends Field<FieldTypes.NESTED> {
  validate: Field<FieldTypes.NESTED>["validate"] = async ({ list }) => {
    const _isInvalid = value => value !== null && value !== undefined && typeof value !== "object";
    const level = getPathLevel(this.path);

    let values: Array<unknown> = list.map(i => i.get(this.path, "validation"));

    if (level) {
      values = values.flat(level);
    }

    return !values.some(_isInvalid);
  };

  _sStatic = (input: FieldSerializerInput) => {
    const { from, ctx } = input;
    const value = Array.isArray(input.value) ? input.value[0] : input.value;
    const oFormat = ctx?.outputFormat || input.format;

    if (!value || typeof value !== "object") {
      if (oFormat === "validation") {
        return value;
      }

      if (value === undefined) {
        return value;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null as any;
    }

    const model = from.model();
    const fieldsMap = getNestedFieldsMap(model, this);
    const defaults = ctx?.defaults ?? true;

    const json = {};

    for (const [k, field] of fieldsMap) {
      if (value[k] === undefined && defaults && "default" in field.options) {
        json[k] = field.serialize(field.options.default, input.format, from, ctx);
      } else if (value[k] === undefined || value[k] === null) {
        json[k] = value[k];
      } else {
        json[k] = field.serialize(value[k], input.format, from, ctx);
      }
    }

    if (this.options.strict) {
      return json;
    }

    if (this.options.defaultField) {
      const noField = Object.keys(value).filter(k => !fieldsMap.has(k));

      if (noField.length) {
        noField.forEach(k => {
          if (value[k] === undefined || value[k] === null) {
            json[k] = value[k];
          } else {
            const tmpField = getFieldFromDefinition(
              this.options.defaultField,
              model.getAdapter(false),
              [this.path, k].join("."),
            );

            json[k] = tmpField.serialize(value[k], input.format, from, ctx);
          }
        });
      }
    }

    return { ...value, ...json };
  };

  _sProxy = (input: FieldSerializerInput) => {
    const { from, ctx } = input;
    const value = Array.isArray(input.value) ? input.value[0] : input.value;
    const oFormat = ctx?.outputFormat || input.format;

    if (!value || typeof value !== "object") {
      if (oFormat === "validation") {
        return value;
      }

      if (value === undefined) {
        return value;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null as any;
    }

    const model = from.model();
    const adapter = model.getAdapter();
    const fieldsMap = getNestedFieldsMap(model, this);

    const _getter = (target: object, prop: string) => {
      let targetField = fieldsMap.get(prop);
      let value = target[prop];

      if (!targetField) {
        if (this.options?.strict) {
          return undefined;
        }

        if (!this.options?.defaultField) {
          return value;
        }

        targetField = getFieldFromDefinition(
          this.options.defaultField,
          adapter,
          [this.path, prop].join("."),
        );
      }

      if (!targetField) {
        return undefined;
      }

      const defaults = ctx?.defaults ?? true;
      if (defaults && value === undefined && "default" in targetField.options) {
        value = targetField.options.default as typeof value;
      }

      if (value === undefined || value === null) {
        return value;
      }

      return targetField.serialize(value, input.format, from, ctx);
    };

    return new Proxy(value, {
      get(target, prop: string) {
        if (prop === "__isProxy") {
          return true;
        }

        if (prop === "__raw") {
          return target;
        }

        return _getter(target, prop);
      },
    });
  };

  serializerMap: Field<FieldTypes.NESTED>["serializerMap"] = {
    json: this._sStatic,
    [Field.defaultSymbol]: this._sProxy,
  };
}

export default FieldNested;
