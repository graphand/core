import FieldTypes from "@/enums/field-types";
import SerializerFormat from "@/enums/serializer-format";
import Field from "@/lib/Field";
import { getFieldFromDefinition, getNestedFieldsMap } from "@/lib/utils";

class FieldNested extends Field<FieldTypes.NESTED> {
  validate: Field<FieldTypes.NESTED>["validate"] = async ({ list }) => {
    const _isInvalid = value => {
      if (value === null || value === undefined) {
        return false;
      }

      return typeof value !== "object";
    };

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);
    return !values.some(_isInvalid);
  };

  sTo: Field<FieldTypes.NESTED>["sTo"] = ({ value, format, from, ctx }) => {
    value = Array.isArray(value) ? value[0] : value;
    const oFormat = ctx?.outputFormat || format;

    if (!value || typeof value !== "object") {
      if (oFormat === SerializerFormat.VALIDATION) {
        return value;
      }

      return value === undefined ? value : null;
    }

    const model = from.model();
    const adapter = model.getAdapter();
    const fieldsMap = getNestedFieldsMap(model, this);

    const _get = (target: object, prop: string) => {
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

      const defaults = ctx?.defaults ?? oFormat !== SerializerFormat.DOCUMENT;
      if (defaults && value === undefined && "default" in targetField.options) {
        value = targetField.options.default as typeof value;
      }

      if (value !== undefined && value !== null) {
        value = targetField.serialize(value, format, from, ctx);
      }

      return value;
    };

    const _serializeJSON = (obj: object) => {
      const json = {};

      for (const [k, field] of fieldsMap) {
        if (obj[k] === undefined || obj[k] === null) {
          json[k] = obj[k];
        } else {
          json[k] = field.serialize(obj[k], format, from, ctx);
        }
      }

      if (this.options.strict) {
        return json;
      }

      if (this.options.defaultField) {
        const noField = Object.keys(obj).filter(k => !fieldsMap.has(k));

        if (noField.length) {
          noField.forEach(k => {
            if (obj[k] === undefined || obj[k] === null) {
              json[k] = obj[k];
            } else {
              const tmpField = getFieldFromDefinition(
                this.options.defaultField,
                adapter,
                [this.path, k].join("."),
              );

              json[k] = tmpField.serialize(obj[k], format, from, ctx);
            }
          });
        }
      }

      return { ...obj, ...json };
    };

    const _serializeObject = (obj: object) => {
      return new Proxy(obj, {
        get(target, prop: string) {
          if (prop === "__isProxy") {
            return true;
          }

          return _get(target, prop);
        },
      });
    };

    if ([SerializerFormat.JSON, SerializerFormat.DOCUMENT].includes(format)) {
      return _serializeJSON(value);
    }

    return _serializeObject(value);
  };
}

export default FieldNested;
