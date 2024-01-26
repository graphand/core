import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";
import Model from "../Model";
import { isObjectId } from "@/lib/utils";
import PromiseModel from "@/lib/PromiseModel";

class FieldRelation extends Field<FieldTypes.RELATION> {
  nextFieldEqObject = false;

  _sToString = value => {
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

    return id;
  };

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

  sTo: Field<FieldTypes.RELATION>["sTo"] = ({ value }) => {
    return this._sToString(value);
  };

  sObject: Field<FieldTypes.RELATION>["sObject"] = ({ value, from, ctx }) => {
    const id = this._sToString(value);

    if (!isObjectId(id)) {
      return null;
    }

    const adapter = from.model().getAdapter();

    // get the referenced model with the same adapter as from parameter
    const model = Model.getClass(this.options.ref, adapter.base);

    return model.get(id, ctx?.transactionCtx);
  };
}

export default FieldRelation;
