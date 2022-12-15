import { ModelAdapterSerializer } from "../types";
import Model from "../lib/Model";
import FieldTypes from "../enums/field-types";
import SerializerFormat from "../enums/serializer-format";

const defaultSerializer: ModelAdapterSerializer<typeof Model> = {
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
        const adapter = from.model.getAdapter();
        const model = Model.getFromSlug(field.options.ref).withAdapter(
          adapter.toConstructor()
        );

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
};

export default defaultSerializer;
