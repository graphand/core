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
  getJSONSubfieldsMap,
} from "./utils";
import Validator from "./Validator";
import CoreError from "./CoreError";
import ValidationFieldError from "./ValidationFieldError";
import ValidationError from "./ValidationError";
import { FieldOptions } from "../types";
import PromiseModelList from "./PromiseModelList";
import PromiseModel from "./PromiseModel";
import ModelList from "./ModelList";

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
  async validate(value) {
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
  _serializeJSON = (
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
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

    const fieldId = getFieldFromDefinition<FieldTypes.ID>(
      { type: FieldTypes.ID },
      from.model.__adapter,
      "_id"
    );

    return fieldId.serialize(id, format, from, ctx);
  };

  _serializeObject = (
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
  ) => {
    // get the referenced model with the same adapter as from parameter
    const adapter = from.model.__adapter.constructor as typeof Adapter;
    let model = Model.getFromSlug(this.options.ref, adapter);

    if (!isObjectId(value)) {
      return null;
    }

    const fieldId = getFieldFromDefinition<FieldTypes.ID>(
      { type: FieldTypes.ID },
      from.model.__adapter,
      "_id"
    );

    const _serialize = (id: any) => {
      return fieldId.serialize(id, format, from, ctx);
    };

    return model.get(_serialize(value), ctx);
  };

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
  ): any {
    switch (format) {
      case SerializerFormat.JSON:
      case SerializerFormat.DOCUMENT:
        return this._serializeJSON(value, format, from, ctx);
      case SerializerFormat.OBJECT:
      default:
        return this._serializeObject(value, format, from, ctx);
    }
  }
}

class DefaultFieldJSON extends Field<FieldTypes.JSON> {
  async validate(value, ctx, slug) {
    if (value === null || value === undefined) {
      return true;
    }

    const model = ctx.model;

    if (!model) {
      throw new CoreError();
    }

    const arrValue = Array.isArray(value) ? value : [value];

    const validators: Array<Validator> = (this.options.validators ?? []).map(
      (def) => getValidatorFromDefinition(def, model.__adapter)
    );

    const fieldsJSONPath = Array.prototype.concat.apply(
      ctx.fieldsJSONPath ?? [],
      [{ slug, field: this }]
    );

    if (this.options.defaultField) {
      const defaultField = getFieldFromDefinition(
        this.options.defaultField,
        model.__adapter,
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

    const subfieldsMap = getJSONSubfieldsMap(model, this);

    return validateDocs(
      arrValue,
      { ...ctx, fieldsJSONPath },
      validators,
      Array.from(subfieldsMap.entries())
    );
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
  ): any {
    const _format = (obj: object) => {
      if (!obj || typeof obj !== "object") {
        return null;
      }

      let formattedEntries = Object.entries(this.options.fields ?? {}).map(
        ([slug, def]) => {
          const field = getFieldFromDefinition(
            def,
            from.model.__adapter,
            this.__path + "." + slug
          );

          let value = obj[slug];

          if (value === undefined && "default" in field.options) {
            value = field.options.default as typeof value;
          }

          if (value !== undefined && value !== null) {
            value = field.serialize(value, format, from, ctx);
          }

          return [slug, value];
        }
      );

      if (this.options.defaultField) {
        const defaultField = getFieldFromDefinition(
          this.options.defaultField,
          from.model.__adapter,
          this.__path + ".__default"
        );

        const defaultEntries = Object.keys(obj)
          .filter((key) => !this.options.fields?.[key])
          .map((slug) => {
            let value = obj[slug];

            if (value === undefined && "default" in defaultField.options) {
              value = defaultField.options.default as typeof value;
            }

            if (value !== undefined && value !== null) {
              value = defaultField.serialize(value, format, from, ctx);
            }

            return [slug, value];
          });

        formattedEntries = formattedEntries.concat(defaultEntries);
      }

      const formatted = Object.fromEntries(formattedEntries);

      if (this.options.strict) {
        return formatted;
      }

      return { ...obj, ...formatted };
    };

    value = Array.isArray(value) ? value[0] : value;

    return _format(value);
  }
}

class DefaultFieldIdentity extends Field<FieldTypes.IDENTITY> {
  async validate(value) {
    if (value === null || value === undefined) {
      return true;
    }

    const [type, id] = value.split(":");

    const allowedTypes = ["user", "account", "token"];

    return allowedTypes.includes(type) && isObjectId(id);
  }

  serialize(value: any, format: SerializerFormat, from: Model): any {
    return value;
  }
}

class DefaultFieldArray extends Field<FieldTypes.ARRAY> {
  async validate(value, ctx, slug) {
    if (value === null || value === undefined) {
      return true;
    }

    const model = ctx.model;

    if (!model) {
      throw new CoreError();
    }

    value = Array.isArray(value) ? value : [value];
    const field = getFieldFromDefinition(
      this.options.items,
      model.__adapter,
      this.__path + ".[]"
    );

    return Promise.all(value.map((v) => field.validate(v, ctx, slug))).then(
      (results) => results.every((r) => r)
    );
  }

  _serializeRelationArray(
    field: Field<FieldTypes.RELATION>,
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
  ) {
    if (format === SerializerFormat.OBJECT) {
      const options = field.options as FieldOptions<FieldTypes.RELATION>;
      const adapter = from.model.__adapter.constructor as typeof Adapter;
      let model = Model.getFromSlug(options.ref, adapter);

      const ids = value;

      if (!ids.every(isObjectId)) {
        throw new CoreError({
          message: `Error serializing array of relations with ids ${ids}`,
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
      from.model.__adapter,
      "_id"
    );

    return value.map((id) => fieldId.serialize(id, format, from, ctx));
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
  ): any {
    const itemsField = getFieldFromDefinition(
      this.options.items,
      from.model.__adapter,
      this.__path + ".[]"
    );

    if (itemsField.type === FieldTypes.RELATION) {
      return this._serializeRelationArray(
        itemsField as Field<FieldTypes.RELATION>,
        value,
        format,
        from,
        ctx
      );
    }

    value = Array.isArray(value) ? value : [value];

    return value.map((v) => itemsField.serialize(v, format, from, ctx));
  }
}

const defaultFieldsMap: Adapter["fieldsMap"] = {
  [FieldTypes.ID]: DefaultFieldId,
  [FieldTypes.NUMBER]: DefaultFieldNumber,
  [FieldTypes.BOOLEAN]: DefaultFieldBoolean,
  [FieldTypes.DATE]: DefaultFieldDate,
  [FieldTypes.TEXT]: DefaultFieldText,
  [FieldTypes.RELATION]: DefaultFieldRelation,
  [FieldTypes.JSON]: DefaultFieldJSON,
  [FieldTypes.IDENTITY]: DefaultFieldIdentity,
  [FieldTypes.ARRAY]: DefaultFieldArray,
};

export default defaultFieldsMap;
