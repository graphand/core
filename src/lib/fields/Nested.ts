import FieldTypes from "@/enums/field-types";
import SerializerFormat from "@/enums/serializer-format";
import { CoreSerializerCtx, ModelInstance } from "@/index";
import Field from "@/lib/Field";
import { getFieldFromDefinition, getNestedFieldsMap } from "@/lib/utils";

class FieldNested extends Field<FieldTypes.NESTED> {
  validate: Field<FieldTypes.NESTED>["validate"] = async ({ list }) => {
    const _isInvalid = value => value !== null && value !== undefined && typeof value !== "object";

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);
    return !values.some(_isInvalid);
  };

  _sStatic = (
    input: {
      value: unknown;
      from: ModelInstance;
      ctx: SerializerCtx & CoreSerializerCtx;
    },
    format: SerializerFormat,
  ) => {
    const { from, ctx } = input;
    const value = Array.isArray(input.value) ? input.value[0] : input.value;
    const oFormat = ctx?.outputFormat || format;

    if (!value || typeof value !== "object") {
      if (oFormat === SerializerFormat.VALIDATION) {
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

    const json = {};

    for (const [k, field] of fieldsMap) {
      if (value[k] === undefined || value[k] === null) {
        json[k] = value[k];
      } else {
        json[k] = field.serialize(value[k], format, from, ctx);
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
              adapter,
              [this.path, k].join("."),
            );

            json[k] = tmpField.serialize(value[k], format, from, ctx);
          }
        });
      }
    }

    return { ...value, ...json };
  };

  _sProxy = (
    input: {
      value: unknown;
      from: ModelInstance;
      ctx: SerializerCtx & CoreSerializerCtx;
    },
    format: SerializerFormat,
  ) => {
    const { from, ctx } = input;
    const value = Array.isArray(input.value) ? input.value[0] : input.value;
    const oFormat = ctx?.outputFormat || format;

    if (!value || typeof value !== "object") {
      if (oFormat === SerializerFormat.VALIDATION) {
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

      const defaults = ctx?.defaults ?? oFormat !== SerializerFormat.DOCUMENT;
      if (defaults && value === undefined && "default" in targetField.options) {
        value = targetField.options.default as typeof value;
      }

      if (value === undefined || value === null) {
        return value;
      }

      return targetField.serialize(value, format, from, ctx);
    };

    return new Proxy(value, {
      get(target, prop: string) {
        if (prop === "__isProxy") {
          return true;
        }

        return _getter(target, prop);
      },
    });
  };

  sJSON: Field<FieldTypes.NESTED>["sJSON"] = opts => {
    return this._sStatic(opts, SerializerFormat.JSON);
  };

  sObject: Field<FieldTypes.NESTED>["sObject"] = ({ value, from, ctx }) => {
    return this._sProxy({ value, from, ctx }, SerializerFormat.OBJECT);
  };

  sDocument: Field<FieldTypes.NESTED>["sDocument"] = ({ value, from, ctx }) => {
    return this._sStatic({ value, from, ctx }, SerializerFormat.DOCUMENT);
  };

  sTo: Field<FieldTypes.NESTED>["sTo"] = input => {
    return this._sProxy(input, input.format);
  };
}

export default FieldNested;
