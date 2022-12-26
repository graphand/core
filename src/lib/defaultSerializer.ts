import Model from "../lib/Model";
import FieldTypes from "../enums/field-types";
import SerializerFormat from "../enums/serializer-format";
import Field from "./Field";
import { AdapterSerializer } from "../types";
import Adapter from "./Adapter";

const defaultSerializer: AdapterSerializer<typeof Model> = {
  [FieldTypes.ID]: {
    serialize: (value) => (typeof value === "string" ? value : String(value)),
  },
  [FieldTypes.NUMBER]: {
    serialize: (value) => Number(value),
  },
  [FieldTypes.BOOLEAN]: {
    serialize: (value) => Boolean(value),
  },
  [FieldTypes.DATE]: {
    serialize: (value) => (value instanceof Date ? value : new Date(value)),
  },
  [FieldTypes.TEXT]: {
    serialize: (value, format, field) => {
      if (field.options.multiple) {
        const arrValue = value && !Array.isArray(value) ? [value] : value;
        return arrValue.map(String);
      }

      return value && Array.isArray(value) ? String(value[0]) : String(value);
    },
  },
  [FieldTypes.RELATION]: {
    serialize: (value, format, field, from) => {
      const _serializeJSON = () => {
        const canGetIds = typeof value === "object" && "getIds" in value;

        if (field.options.multiple) {
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

      const _serializeObject = () => {
        // get the referenced model with the same adapter as from parameter
        const adapter = from.model.__adapter.constructor as typeof Adapter;
        const model = Model.getFromSlug(field.options.ref).withAdapter(adapter);

        if (field.options.multiple) {
          const ids = Array.isArray(value) ? value : [value];
          return model.getList({ ids });
        }

        const id = Array.isArray(value) ? value[0] : value;
        return model.get(id);
      };

      switch (format) {
        case SerializerFormat.JSON:
        case SerializerFormat.DOCUMENT:
          return _serializeJSON();
        case SerializerFormat.OBJECT:
        default:
          return _serializeObject();
      }
    },
  },
  [FieldTypes.JSON]: {
    serialize: (value, format, field, from) => {
      let __fields: Map<string, Field> = new Map();

      if (field.options.fields) {
        field.options.fields.forEach((f) => {
          __fields.set(f.slug, Field.fromDefinition(f));
        });
      }

      const _format = (obj: object) => {
        const formatted = Array.from(__fields.keys()).reduce((final, key) => {
          const field = __fields.get(key);

          let value = obj[key];

          value = field.serialize(value, format, from);

          return Object.assign(final, { [key]: value });
        }, {});

        if (field.options.strict) {
          return formatted;
        }

        return { ...obj, ...formatted };
      };

      if (field.options.multiple) {
        return Object.values(value).map(_format);
      }

      return _format(value);
    },
  },
};

export default defaultSerializer;
