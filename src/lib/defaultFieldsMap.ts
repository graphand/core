import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";
import SerializerFormat from "@/enums/serializer-format";
import Model from "@/lib/Model";
import Adapter from "@/lib/Adapter";
import { getFieldFromDefinition, getNestedFieldsMap, isObjectId } from "@/lib/utils";
import CoreError from "@/lib/CoreError";
import { FieldOptions } from "@/types";
import PromiseModelList from "@/lib/PromiseModelList";
import PromiseModel from "@/lib/PromiseModel";
import ModelList from "@/lib/ModelList";
import IdentityTypes from "@/enums/identity-types";

class DefaultFieldId extends Field<FieldTypes.ID> {
  serialize(value: any): any {
    return typeof value === "string" ? value : String(value);
  }
}

class DefaultFieldNumber extends Field<FieldTypes.NUMBER> {
  serialize(value: any): any {
    return parseFloat(value);
  }
}

class DefaultFieldBoolean extends Field<FieldTypes.BOOLEAN> {
  serialize(value: any): any {
    return Boolean(value);
  }
}

class DefaultFieldDate extends Field<FieldTypes.DATE> {
  serialize(value: any): any {
    return value instanceof Date ? value : new Date(value);
  }
}

class DefaultFieldText extends Field<FieldTypes.TEXT> {
  async validate(list: Array<Model>) {
    const _isInvalid = (value: any) => {
      if (value === null || value === undefined) {
        return false;
      }

      if (this.options.options?.length && this.options.strict) {
        return !this.options.options.includes(value);
      }

      if (isObjectId(value)) {
        return true;
      }

      return false;
    };

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);

    return !values.some(_isInvalid);
  }

  serialize(value: any, format: string): any {
    const res = Array.isArray(value) ? String(value[0]) : String(value);

    if (
      this.options.options?.length &&
      this.options.strict &&
      !this.options.options.includes(res) &&
      format !== SerializerFormat.VALIDATION
    ) {
      return undefined;
    }

    return res;
  }
}

class DefaultFieldRelation extends Field<FieldTypes.RELATION> {
  nextFieldEqObject = false;

  async validate(list: Array<Model>) {
    const _isInvalid = (value: any) => {
      if (value === null || value === undefined) {
        return false;
      }

      return !isObjectId(value);
    };

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);

    return !values.some(_isInvalid);
  }

  _serializeJSON = (value: any, format: string, from: Model, ctx: SerializerCtx = {}) => {
    if (!value) {
      return null;
    }

    let id: string;

    if (value instanceof Model) {
      id = value._id;
    } else if (value instanceof PromiseModel && typeof value.query === "string") {
      id = value.query;
    } else {
      id = value;
    }

    const adapter = from.model.getAdapter();
    const fieldId = getFieldFromDefinition<FieldTypes.ID>({ type: FieldTypes.ID }, adapter, "_id");

    return fieldId.serialize(id, format, from, ctx);
  };

  _serializeObject = (value: any, format: string, from: Model, ctx: SerializerCtx = {}) => {
    const adapter = from.model.getAdapter();

    // get the referenced model with the same adapter as from parameter
    const model = Model.getFromSlug(this.options.ref, adapter.base);

    if (!isObjectId(value)) {
      return null;
    }

    const fieldId = getFieldFromDefinition<FieldTypes.ID>({ type: FieldTypes.ID }, adapter, "_id");

    const _id = fieldId.serialize(value, format, from, ctx);

    return model.get(_id, ctx?.transactionCtx);
  };

  serialize(value: any, format: string, from: Model, ctx: SerializerCtx = {}): any {
    if (
      [
        SerializerFormat.JSON,
        SerializerFormat.DOCUMENT,
        SerializerFormat.NEXT_FIELD,
        SerializerFormat.VALIDATION,
      ].includes(format as SerializerFormat)
    ) {
      return this._serializeJSON(value, format, from, ctx);
    }

    return this._serializeObject(value, format, from, ctx);
  }
}

class DefaultFieldNested extends Field<FieldTypes.NESTED> {
  async validate(list: Array<Model>) {
    const _isInvalid = (value: any) => {
      if (value === null || value === undefined) {
        return false;
      }

      return typeof value !== "object";
    };

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);
    return !values.some(_isInvalid);
  }

  serialize(value: any, format: string, from: Model, ctx: SerializerCtx = {}): any {
    value = Array.isArray(value) ? value[0] : value;
    const oFormat = ctx.outputFormat || format;

    if (!value || typeof value !== "object") {
      if (oFormat === SerializerFormat.VALIDATION) {
        return value;
      }

      return value === undefined ? value : null;
    }

    const adapter = from.model.getAdapter();
    const fieldsMap = getNestedFieldsMap(from.model, this);

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

    if ([SerializerFormat.JSON, SerializerFormat.DOCUMENT].includes(format as SerializerFormat)) {
      return _serializeJSON(value);
    }

    return _serializeObject(value);
  }
}

class DefaultFieldIdentity extends Field<FieldTypes.IDENTITY> {
  async validate(list: Array<Model>) {
    const _isInvalid = (value: any) => {
      if (value === null || value === undefined) {
        return false;
      }

      const [type, id] = value.split(":");

      return !Object.values(IdentityTypes).includes(type) || !isObjectId(id);
    };

    const values = list.map(i => i.get(this.path, SerializerFormat.VALIDATION)).flat(Infinity);

    return !values.some(_isInvalid);
  }
}

class DefaultFieldArray extends Field<FieldTypes.ARRAY> {
  nextFieldEqObject = false;

  _serializeRelationArray(
    options: FieldOptions<FieldTypes.RELATION>,
    value: any,
    format: string,
    from: Model,
    ctx: SerializerCtx = {},
  ) {
    const adapter = from.model.getAdapter();

    if (format === SerializerFormat.OBJECT) {
      const model = Model.getFromSlug(options.ref, adapter.base);

      if (!value?.every(isObjectId)) {
        throw new CoreError({
          message: `Error serializing array of relations with ids ${value}`,
        });
      }

      let res;

      if (model.isSingle()) {
        value = Array.isArray(value) ? value : [value];

        res = value.map((v, i) => {
          const itemsField = getFieldFromDefinition(
            this.options.items,
            adapter,
            this.path + `.[${i}]`,
          );

          return itemsField.serialize(v, format, from, ctx);
        });
      } else {
        res = model.getList({ ids: value }, ctx?.transactionCtx);
      }

      return res;
    } else if (value instanceof PromiseModelList || value instanceof ModelList) {
      value = value.getIds();
    }

    if (!value) {
      return [];
    }

    const fieldId = getFieldFromDefinition<FieldTypes.ID>({ type: FieldTypes.ID }, adapter, "_id");

    return value.map(id => fieldId.serialize(id, format, from, ctx));
  }

  serialize(value: any, format: string, from: Model, ctx: SerializerCtx = {}): any {
    if (this.options.items?.type === FieldTypes.RELATION) {
      return this._serializeRelationArray(this.options.items?.options, value, format, from, ctx);
    }

    const adapter = from.model.getAdapter();
    value = Array.isArray(value) ? value : [value];

    return value.map((v, i) => {
      const itemsField = getFieldFromDefinition(this.options.items, adapter, this.path + `.[${i}]`);

      return itemsField.serialize(v, format, from, ctx);
    });
  }
}

const defaultFieldsMap: Adapter["fieldsMap"] = {
  [FieldTypes.ID]: DefaultFieldId,
  [FieldTypes.NUMBER]: DefaultFieldNumber,
  [FieldTypes.BOOLEAN]: DefaultFieldBoolean,
  [FieldTypes.DATE]: DefaultFieldDate,
  [FieldTypes.TEXT]: DefaultFieldText,
  [FieldTypes.RELATION]: DefaultFieldRelation,
  [FieldTypes.NESTED]: DefaultFieldNested,
  [FieldTypes.IDENTITY]: DefaultFieldIdentity,
  [FieldTypes.ARRAY]: DefaultFieldArray,
};

export default defaultFieldsMap;
