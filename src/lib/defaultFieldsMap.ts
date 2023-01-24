import FieldTypes from "../enums/field-types";
import Field from "./Field";
import SerializerFormat from "../enums/serializer-format";
import Model from "./Model";
import Adapter from "./Adapter";
import {
  createFieldFromDefinition,
  createValidatorFromDefinition,
  isGraphandError,
  validateDocs,
} from "../utils";
import { DocumentDefinition, FieldDefinition } from "../types";
import Validator from "./Validator";

class DefaultFieldId extends Field<FieldTypes.ID> {
  serialize(value: any): any {
    return typeof value === "string" ? value : String(value);
  }
}

class DefaultFieldNumber extends Field<FieldTypes.NUMBER> {
  serialize(value: any): any {
    return typeof value === "string" ? value : String(value);
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
  serialize(value: any, format: SerializerFormat, from: Model): any {
    if (this.options.multiple) {
      const arrValue = value && !Array.isArray(value) ? [value] : value;
      return arrValue.map(String);
    }

    return value && Array.isArray(value) ? String(value[0]) : String(value);
  }
}

class DefaultFieldRelation extends Field<FieldTypes.RELATION> {
  _serializeJSON = (value: any) => {
    const canGetIds = typeof value === "object" && "getIds" in value;

    if (this.options.multiple) {
      const arrValue = canGetIds
        ? value.getIds()
        : typeof value === "string"
        ? [value]
        : [value._id?.toString() ?? value?.toString()].filter(Boolean);

      return arrValue.map((i) => i?.toString());
    }

    return canGetIds
      ? value.getIds()[0]?.toString()
      : typeof value === "string"
      ? value
      : value._id?.toString() ?? value?.toString();
  };

  _serializeObject = (value: any, format: SerializerFormat, from: Model) => {
    // get the referenced model with the same adapter as from parameter
    const adapter = from.model.__adapter.constructor as typeof Adapter;
    const model = Model.getFromSlug(this.options.ref).withAdapter(adapter);

    if (this.options.multiple) {
      const ids = Array.isArray(value) ? value : [value];
      return model.getList({ ids });
    }

    const id = Array.isArray(value) ? value[0] : value;
    return model.get(id);
  };

  serialize(value: any, format: SerializerFormat, from: Model): any {
    switch (format) {
      case SerializerFormat.JSON:
      case SerializerFormat.DOCUMENT:
        return this._serializeJSON(value);
      case SerializerFormat.OBJECT:
      default:
        return this._serializeObject(value, format, from);
    }
  }
}

class DefaultFieldJSON extends Field<FieldTypes.JSON> {
  async validate(value = [], ctx, slug) {
    const model = ctx.model;

    if (!model) {
      throw new Error(`FIELD_VALIDATE_CTX_NO_MODEL`);
    }

    const validators: Array<Validator> = (this.options.validators ?? []).map(
      (def) => createValidatorFromDefinition(def, model.__adapter)
    );

    const fieldsEntries: Array<[string, Field<FieldTypes>]> = Object.entries(
      this.options.fields ?? {}
    )
      .filter(([slug]) => slug !== "__default__")
      .map(([slug, def]) => {
        const field = createFieldFromDefinition(def, model.__adapter);

        return [slug, field];
      });

    const fieldsJSONPath = Array.prototype.concat.apply(
      ctx.fieldsJSONPath ?? [],
      [{ slug, field: this }]
    );

    const arrValue = Array.isArray(value) ? value : [value];

    if (this.options.fields && "__default__" in this.options.fields) {
      const defaultField = createFieldFromDefinition(
        this.options.fields["__default__"],
        model.__adapter
      );

      const defaultEntries = arrValue
        .map((v) =>
          Object.entries(v).filter(([slug]) => !this.options.fields[slug])
        )
        .flat();
      const errorsSet = new Set();

      if (defaultEntries?.length) {
        await Promise.all(
          defaultEntries.map(async ([_slug, value]) => {
            try {
              const validated = await defaultField.validate(value, ctx, _slug);
              if (!validated) {
                throw new Error();
              }
            } catch (err) {
              if (isGraphandError(err)) {
                const errs = Array.isArray(err) ? err : [err];
                errs.forEach((nestedErr) => {
                  const e = new Error(
                    `FIELD_VALIDATION_FAILED_${defaultField.type.toUpperCase()}:${_slug}:${
                      nestedErr.message
                    }`
                  );
                  errorsSet.add(e);
                });
              } else {
                const e = new Error(
                  `FIELD_VALIDATION_FAILED_${defaultField.type.toUpperCase()}:${_slug}`
                );
                errorsSet.add(e);
              }
            }
          })
        );
      }

      if (errorsSet.size) {
        throw Array.from(errorsSet);
      }
    }

    return validateDocs(
      arrValue,
      { ...ctx, fieldsJSONPath },
      validators,
      fieldsEntries
    );
  }
  serialize(value: any, format: SerializerFormat, from: Model): any {
    const _format = (obj: object) => {
      let formattedEntries = Object.entries(this.options.fields ?? {}).map(
        ([slug, def]) => {
          const field = createFieldFromDefinition(def, from.model.__adapter);

          let value = obj[slug];

          if (value === undefined && "default" in field.options) {
            value = field.options.default as typeof value;
          }

          if (value !== undefined && value !== null) {
            value = field.serialize(value, format, from);
          }

          return [slug, value];
        }
      );

      if (this.options.fields && "__default__" in this.options.fields) {
        const defaultField = createFieldFromDefinition(
          this.options.fields["__default__"],
          from.model.__adapter
        );

        const defaultEntries = Object.keys(obj)
          .filter((key) => !this.options.fields[key])
          .map((slug) => {
            let value = obj[slug];

            if (value === undefined && "default" in defaultField.options) {
              value = defaultField.options.default as typeof value;
            }

            if (value !== undefined && value !== null) {
              value = defaultField.serialize(value, format, from);
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

    if (this.options.multiple) {
      return Object.values(value).map(_format);
    }

    return _format(value);
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
};

export default defaultFieldsMap;
