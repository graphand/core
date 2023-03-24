import FieldTypes from "../enums/field-types";
import Field from "./Field";
import SerializerFormat from "../enums/serializer-format";
import Model from "./Model";
import Adapter from "./Adapter";
import {
  createFieldFromDefinition,
  createValidatorFromDefinition,
  isObjectId,
  validateDocs,
} from "./utils";
import Validator from "./Validator";
import CoreError from "./CoreError";
import ValidationFieldError from "./ValidationFieldError";
import ValidationError from "./ValidationError";
import { FieldOptions } from "../types";
import * as console from "console";

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
    // if (this.options.multiple) {
    //   const arrValue = value && !Array.isArray(value) ? [value] : value;
    //   const res = arrValue.map(String);
    //   if (this.options?.options?.length && !this.options.creatable) {
    //     return res.filter((i) => this.options.options.includes(i));
    //   }
    //
    //   return res;
    // }

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
  _serializeJSON = (value: any) => {
    const canGetIds = typeof value === "object" && "getIds" in value;

    // if (this.options.multiple) {
    //   let ids;
    //
    //   if (canGetIds) {
    //     ids = value.getIds();
    //   } else {
    //     const arrValue = Array.isArray(value) ? value : [value];
    //     ids = arrValue
    //       .map((v) => (typeof v === "object" && "_id" in v ? v._id : v))
    //       .filter(Boolean);
    //   }
    //
    //   return ids.map((i) => i?.toString());
    // }

    let id;

    if (canGetIds) {
      id = value.getIds()[0];
    }

    id ??= typeof value === "object" && "_id" in value ? value._id : value;

    return id?.toString?.() || id;
  };

  _serializeObject = (
    value: any,
    format: SerializerFormat,
    from: Model,
    path: string,
    ctx: ExecutorCtx = {}
  ) => {
    // get the referenced model with the same adapter as from parameter
    const adapter = from.model.__adapter.constructor as typeof Adapter;
    let model = Model.getFromSlug(this.options.ref, adapter);

    // if (this.options.multiple) {
    //   const ids = Array.isArray(value) ? value : [value];
    //   return model.getList({ ids }, ctx);
    // }

    if (!isObjectId(value)) {
      return null;
    }

    return model.get(String(value), ctx);
  };

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    path: string,
    ctx: ExecutorCtx = {}
  ): any {
    switch (format) {
      case SerializerFormat.JSON:
      case SerializerFormat.DOCUMENT:
        return this._serializeJSON(value);
      case SerializerFormat.OBJECT:
      default:
        return this._serializeObject(value, format, from, path, ctx);
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
      (def) => createValidatorFromDefinition(def, model.__adapter)
    );

    const fieldsEntries: Array<[string, Field<FieldTypes>]> = Object.entries(
      this.options.fields ?? {}
    ).map(([slug, def]) => {
      const field = createFieldFromDefinition(def, model.__adapter);

      return [slug, field];
    });

    const fieldsJSONPath = Array.prototype.concat.apply(
      ctx.fieldsJSONPath ?? [],
      [{ slug, field: this }]
    );

    if (this.options.defaultField) {
      const defaultField = createFieldFromDefinition(
        this.options.defaultField,
        model.__adapter
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

    return validateDocs(
      arrValue,
      { ...ctx, fieldsJSONPath },
      validators,
      fieldsEntries
    );
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    path: string,
    ctx: ExecutorCtx = {}
  ): any {
    const _format = (obj: object) => {
      let formattedEntries = Object.entries(this.options.fields ?? {}).map(
        ([slug, def]) => {
          const field = createFieldFromDefinition(def, from.model.__adapter);

          let value = obj[slug];

          if (value === undefined && "default" in field.options) {
            value = field.options.default as typeof value;
          }

          if (value !== undefined && value !== null) {
            value = field.serialize(
              value,
              format,
              from,
              [path, slug].join("."),
              ctx
            );
          }

          return [slug, value];
        }
      );

      if (this.options.defaultField) {
        const defaultField = createFieldFromDefinition(
          this.options.defaultField,
          from.model.__adapter
        );

        const defaultEntries = Object.keys(obj)
          .filter((key) => !this.options.fields?.[key])
          .map((slug) => {
            let value = obj[slug];

            if (value === undefined && "default" in defaultField.options) {
              value = defaultField.options.default as typeof value;
            }

            if (value !== undefined && value !== null) {
              value = defaultField.serialize(
                value,
                format,
                from,
                [path, slug].join("."),
                ctx
              );
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
  async validate(value, ctx, slug) {
    if (value === null || value === undefined) {
      return true;
    }

    const [type, id] = value.split(":");

    const allowedTypes = ["user", "account", "token"];

    return allowedTypes.includes(type) && isObjectId(id);
  }
  serialize(value: any, format: SerializerFormat, from: Model): any {
    const [type, id] = value.split(":");
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
    const field = createFieldFromDefinition(
      this.options.items,
      model.__adapter
    );

    return Promise.all(value.map((v) => field.validate(v, ctx, slug))).then(
      (results) => results.every((r) => r)
    );
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    path: string,
    ctx: ExecutorCtx = {}
  ): any {
    value = Array.isArray(value) ? value : [value];

    const field = createFieldFromDefinition(
      this.options.items,
      from.model.__adapter
    );

    if (
      field.type === FieldTypes.RELATION &&
      format === SerializerFormat.OBJECT
    ) {
      const options = field.options as FieldOptions<FieldTypes.RELATION>;
      const adapter = from.model.__adapter.constructor as typeof Adapter;
      let model = Model.getFromSlug(options.ref, adapter);

      return model.getList(
        {
          ids: value,
        },
        ctx
      );
    }

    return value.map((v) => field.serialize(v, format, from, path, ctx));
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
