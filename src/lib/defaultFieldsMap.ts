import FieldTypes from "../enums/field-types";
import Field from "./Field";
import SerializerFormat from "../enums/serializer-format";
import Model from "./Model";
import Adapter from "./Adapter";
import {
  getFieldFromDefinition,
  getValidatorFromDefinition,
  isObjectId,
  validateDocs,
  getNestedFieldsMap,
} from "./utils";
import Validator from "./Validator";
import CoreError from "./CoreError";
import ValidationFieldError from "./ValidationFieldError";
import ValidationError from "./ValidationError";
import { FieldOptions, ValidatorDefinition } from "../types";
import PromiseModelList from "./PromiseModelList";
import PromiseModel from "./PromiseModel";
import ModelList from "./ModelList";
import IdentityTypes from "../enums/identity-types";

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
  serialize(value: any, format): any {
    return value instanceof Date ? value : new Date(value);
  }
}

class DefaultFieldText extends Field<FieldTypes.TEXT> {
  async validate(value) {
    if (value === null || value === undefined) {
      return true;
    }

    if (this.options.options?.length && this.options.strict) {
      if (Array.isArray(value)) {
        return value.every((i) => this.options.options.includes(i));
      }

      return this.options.options.includes(value);
    }

    return true;
  }

  serialize(value: any, format: SerializerFormat, from: Model): any {
    const res =
      value && Array.isArray(value) ? String(value[0]) : String(value);

    if (
      this.options.options?.length &&
      this.options.strict &&
      !this.options.options.includes(res)
    ) {
      return undefined;
    }

    return res;
  }
}

class DefaultFieldRelation extends Field<FieldTypes.RELATION> {
  nextFieldEqObject = false;

  _serializeJSON = (
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: SerializerCtx = {}
  ) => {
    if (!value) {
      return null;
    }

    let id: string;

    if (value instanceof Model) {
      id = value._id;
    } else if (
      value instanceof PromiseModel &&
      typeof value.query === "string"
    ) {
      id = value.query;
    } else {
      id = value;
    }

    const adapter = from.model.getAdapter();
    const fieldId = getFieldFromDefinition<FieldTypes.ID>(
      { type: FieldTypes.ID },
      adapter,
      "_id"
    );

    return fieldId.serialize(id, format, from, ctx);
  };

  _serializeObject = (
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: SerializerCtx = {}
  ) => {
    const adapter = from.model.getAdapter();

    // get the referenced model with the same adapter as from parameter
    let model = Model.getFromSlug(this.options.ref, adapter.base);

    if (!isObjectId(value)) {
      return null;
    }

    const fieldId = getFieldFromDefinition<FieldTypes.ID>(
      { type: FieldTypes.ID },
      adapter,
      "_id"
    );

    const _id = fieldId.serialize(value, format, from, ctx);

    return model.get(_id, ctx);
  };

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: SerializerCtx = {}
  ): any {
    if (
      [
        SerializerFormat.JSON,
        SerializerFormat.DOCUMENT,
        SerializerFormat.NEXT_FIELD,
      ].includes(format)
    ) {
      return this._serializeJSON(value, format, from, ctx);
    }

    return this._serializeObject(value, format, from, ctx);
  }
}

class DefaultFieldNested extends Field<FieldTypes.NESTED> {
  async validate(value, ctx, slug) {
    if (value === null || value === undefined) {
      return true;
    }

    const model = ctx.model;

    if (!model) {
      throw new CoreError();
    }

    const adapter = model.getAdapter();

    const arrValue = Array.isArray(value) ? value : [value];

    const validators: Array<Validator> = (this.options.validators ?? []).map(
      (def) => getValidatorFromDefinition(def, adapter, this.__path)
    );

    if (this.options.defaultField) {
      const defaultField = getFieldFromDefinition(
        this.options.defaultField,
        adapter,
        this.__path + ".__defaultField"
      );

      const defaultEntries = arrValue
        .map((v) =>
          Object.entries(v).filter(
            ([slug]: [string, unknown]) => !this.options.fields?.[slug]
          )
        )
        .flat();

      const errorsFieldsSet = new Set<ValidationFieldError>();

      if (defaultEntries?.length) {
        await Promise.all(
          defaultEntries.map(async ([_slug, value]) => {
            try {
              const validated = await defaultField.validate(value, ctx, _slug);
              if (!validated) {
                throw null;
              }
            } catch (err) {
              const e = new ValidationFieldError({
                slug: _slug,
                field: defaultField,
                validationError: err instanceof ValidationError ? err : null,
              });

              errorsFieldsSet.add(e);
            }
          })
        );
      }

      if (errorsFieldsSet.size) {
        throw new ValidationError({
          fields: Array.from(errorsFieldsSet),
        });
      }
    }

    const subfieldsMap = getNestedFieldsMap(model, this);

    return validateDocs(
      arrValue,
      {
        validators,
        fieldsEntries: Array.from(subfieldsMap.entries()),
      },
      ctx
    );
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: SerializerCtx = {}
  ): any {
    value = Array.isArray(value) ? value[0] : value;

    if (!value || typeof value !== "object") {
      return null;
    }

    const adapter = from.model.getAdapter();

    const _serializeJSON = (obj: object) => {
      const formattedEntries = [];
      const fields = this.options.fields ?? {};
      const entries = Object.entries(fields);

      for (let i = 0; i < entries.length; i++) {
        const [slug, def] = entries[i];
        const field = getFieldFromDefinition(
          def,
          adapter,
          [this.__path, slug].join(".")
        );

        let v = obj[slug];

        if (v === undefined && "default" in field.options) {
          v = field.options.default as typeof v;
        }

        if (v !== undefined && v !== null) {
          v = field.serialize(v, format, from, ctx);
        }

        if (v !== undefined) {
          formattedEntries.push([slug, v]);
        }
      }

      if (this.options.defaultField) {
        const defaultField = getFieldFromDefinition(
          this.options.defaultField,
          adapter,
          this.__path + ".__default"
        );

        const defaultEntries = [];
        for (const key in obj) {
          if (!this.options.fields?.[key]) {
            let v = obj[key];

            if (v === undefined && "default" in defaultField.options) {
              v = defaultField.options.default as typeof v;
            }

            if (v !== undefined && v !== null) {
              v = defaultField.serialize(v, format, from, ctx);
            }

            defaultEntries.push([key, v]);
          }
        }

        Array.prototype.push.apply(formattedEntries, defaultEntries);
      }

      const formatted = Object.fromEntries(formattedEntries.filter(Boolean));

      if (this.options.strict) {
        return formatted;
      }

      return { ...obj, ...formatted };
    };

    const _serializeObject = (obj: object) => {
      const isStrict = this.options.strict ?? false;
      const fields = this.options.fields ?? {};
      const path = this.__path;
      let defaultField;
      const fieldsMap = new Map<string, Field>();

      if (this.options.defaultField) {
        defaultField = getFieldFromDefinition(
          this.options.defaultField,
          adapter,
          this.__path + ".__default"
        );
      }

      return new Proxy(obj, {
        get(target, prop: string) {
          if (prop === "__isProxy") {
            return true;
          }

          if (isStrict && !(prop in fields)) {
            return undefined;
          }

          let propField;
          if (prop in fields) {
            propField =
              fieldsMap.get(prop) ??
              getFieldFromDefinition(
                fields[prop],
                adapter,
                [path, prop].join(".")
              );
          }

          let field: Field = propField ?? defaultField;
          let value = target[prop];

          if (field) {
            fieldsMap.set(prop, field);
          } else {
            return isStrict ? undefined : value;
          }

          if (value === undefined && "default" in field.options) {
            value = field.options.default as typeof value;
          }

          if (value !== undefined && value !== null) {
            value = field.serialize(value, format, from, ctx);
          }

          return value;
        },
      });
    };

    if ([SerializerFormat.JSON, SerializerFormat.DOCUMENT].includes(format)) {
      return _serializeJSON(value);
    }

    return _serializeObject(value);
  }
}

class DefaultFieldIdentity extends Field<FieldTypes.IDENTITY> {
  async validate(value) {
    if (value === null || value === undefined) {
      return true;
    }

    const [type, id] = value.split(":");

    return Object.values(IdentityTypes).includes(type) && isObjectId(id);
  }

  serialize(value: any, format: SerializerFormat, from: Model): any {
    return value;
  }
}

class DefaultFieldArray extends Field<FieldTypes.ARRAY> {
  nextFieldEqObject = false;

  async validate(value, ctx, slug) {
    if (value === null || value === undefined) {
      return true;
    }

    const model = ctx.model;

    if (!model) {
      throw new CoreError();
    }

    const adapter = model.getAdapter();

    const arrValue = Array.isArray(value) ? value : [value];
    const field = getFieldFromDefinition(
      this.options.items,
      adapter,
      this.__path + ".[]"
    );

    const validators: Array<Validator> = (this.options.validators ?? []).map(
      (def) => {
        return getValidatorFromDefinition(
          def as ValidatorDefinition,
          adapter,
          this.__path
        );
      }
    );

    await validateDocs(arrValue, { validators }, ctx);

    return Promise.all([
      ...arrValue.map((v) => field.validate(v, ctx, slug)),
      validateDocs(arrValue, { validators }, ctx),
    ]).then((results) => results.every((r) => r));
  }

  _serializeRelationArray(
    options: FieldOptions<FieldTypes.RELATION>,
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: SerializerCtx = {}
  ) {
    const adapter = from.model.getAdapter();

    if (format === SerializerFormat.OBJECT) {
      let model = Model.getFromSlug(options.ref, adapter.base);

      let ids = value;

      if (!ids.every(isObjectId)) {
        throw new CoreError({
          message: `Error serializing array of relations with ids ${ids}`,
        });
      }

      if (model.single) {
        value = Array.isArray(value) ? value : [value];

        return value.map((v, i) => {
          const itemsField = getFieldFromDefinition(
            this.options.items,
            adapter,
            this.__path + `.[${i}]`,
            this.__path + ".[]"
          );

          return itemsField.serialize(v, format, from, ctx);
        });
      }

      return model.getList({ ids }, ctx);
    } else if (
      value instanceof PromiseModelList ||
      value instanceof ModelList
    ) {
      value = value.getIds();
    }

    if (!value) {
      return [];
    }

    const fieldId = getFieldFromDefinition<FieldTypes.ID>(
      { type: FieldTypes.ID },
      adapter,
      "_id"
    );

    return value.map((id) => fieldId.serialize(id, format, from, ctx));
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: SerializerCtx = {}
  ): any {
    if (this.options.items?.type === FieldTypes.RELATION) {
      return this._serializeRelationArray(
        this.options.items?.options,
        value,
        format,
        from,
        ctx
      );
    }

    const adapter = from.model.getAdapter();
    value = Array.isArray(value) ? value : [value];

    return value.map((v, i) => {
      const itemsField = getFieldFromDefinition(
        this.options.items,
        adapter,
        this.__path + `.[${i}]`,
        this.__path + ".[]"
      );

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
