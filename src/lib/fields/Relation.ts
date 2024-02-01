import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";
import Model from "@/lib/Model";
import { isObjectId } from "@/lib/utils";
import PromiseModel from "@/lib/PromiseModel";
import { FieldSerializerInput } from "@/types";

class FieldRelation extends Field<FieldTypes.RELATION> {
  nextFieldEqObject = false;

  validate: Field<FieldTypes.RELATION>["validate"] = async ({ list }) => {
    const _isInvalid = value => {
      if (value === null || value === undefined) {
        return false;
      }

      return !isObjectId(value);
    };

    const values = list.map(i => i.get(this.path, "validation")).flat(Infinity);

    return !values.some(_isInvalid);
  };

  _sString = ({ value, format }: FieldSerializerInput) => {
    if (!value) {
      return null;
    }

    let id: string;

    if (typeof value === "object" && "_id" in value) {
      id = String(value._id);
    } else if (value instanceof PromiseModel && typeof value.query === "string") {
      id = value.query;
    } else {
      id = String(value);
    }

    if (!isObjectId(id) && format !== "validation") {
      return undefined;
    }

    return id;
  };

  _sObject = (input: FieldSerializerInput) => {
    const id = this._sString(input);

    if (!isObjectId(id)) {
      return null;
    }

    const { from, ctx } = input;

    const adapter = from.model().getAdapter();

    // get the referenced model with the same adapter as from parameter
    const model = Model.getClass(this.options.ref, adapter.base);

    return model.get(id, ctx?.transactionCtx);
  };

  serializerMap: Field<FieldTypes.RELATION>["serializerMap"] = {
    object: this._sObject,
    [Field.defaultSymbol]: this._sString,
  };
}

export default FieldRelation;
