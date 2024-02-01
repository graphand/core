import FieldTypes from "@/enums/field-types";
import { FieldOptions, FieldSerializerInput } from "@/types";
import Field from "@/lib/Field";
import Model from "@/lib/Model";
import { getFieldFromDefinition, isObjectId } from "@/lib/utils";
import CoreError from "@/lib/CoreError";
import PromiseModelList from "@/lib/PromiseModelList";
import ModelList from "@/lib/ModelList";

class FieldArray extends Field<FieldTypes.ARRAY> {
  nextFieldEqObject = false;

  _sToRelArr = (input: FieldSerializerInput) => {
    const options = this.options.items?.options as FieldOptions<FieldTypes.RELATION>;
    const { value, format, from, ctx } = input;

    const adapter = from.model().getAdapter();
    let arrVal = Array.isArray(value) ? value : [value];

    if (format === "object") {
      const model = Model.getClass(options.ref, adapter.base);

      if (!arrVal?.every(isObjectId)) {
        throw new CoreError({
          message: `Error serializing array of relations with ids ${value}`,
        });
      }

      let res;

      if (model.isSingle()) {
        res = arrVal.map((v, i) => {
          const itemsField = getFieldFromDefinition(
            this.options.items,
            adapter,
            this.path + `.[${i}]`,
          );

          return itemsField.serialize(v, format, from, ctx);
        });
      } else {
        const ids = arrVal.map(String);
        res = model.getList({ ids }, ctx?.transactionCtx);
      }

      return res;
    } else if (value instanceof PromiseModelList || value instanceof ModelList) {
      arrVal = value.getIds();
    }

    if (!value) {
      return [];
    }

    const fieldId = getFieldFromDefinition<FieldTypes.ID>({ type: FieldTypes.ID }, adapter, "_id");

    return arrVal.map(id => fieldId.serialize(id, format, from, ctx));
  };

  _sStatic = (input: FieldSerializerInput) => {
    const { value, format, from, ctx } = input;
    const adapter = from.model().getAdapter();
    const arrVal = Array.isArray(value) ? value : [value];

    return arrVal.map((v, i) => {
      const itemsField = getFieldFromDefinition(this.options.items, adapter, this.path + `.[${i}]`);

      return itemsField.serialize(v, format, from, ctx);
    });
  };

  _sDefault = (input: FieldSerializerInput) => {
    if (this.options.items?.type === FieldTypes.RELATION) {
      return this._sToRelArr(input);
    }

    return this._sStatic(input);
  };

  serializerMap: Field<FieldTypes.ARRAY>["serializerMap"] = {
    [Field.defaultSymbol]: this._sDefault,
  };
}

export default FieldArray;
