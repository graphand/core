import Model from "../Model";
import ModelList from "../ModelList";
import Field from "../Field";
import PromiseModel from "../PromiseModel";
import PromiseModelList from "../PromiseModelList";
import FieldTypes from "../../enums/field-types";

type PromiseModelOn<T extends Model> = PromiseModel<T> & {};

class FieldRelation extends Field<FieldTypes.RELATION> {
  isSerialized(value) {
    return (
      (Array.isArray(value) && value.every((i) => typeof i === "string")) ||
      typeof value === "string"
    );
  }

  deserialize(encodedValue: string | string[], from: Model) {
    if (!encodedValue) {
      return encodedValue;
    }

    // get the referenced model with the same adapter as from parameter
    const adapter = from.model.getAdapter();
    const model = Model.getFromScope(this.options.ref).withAdapter(
      adapter.toConstructor()
    );

    if (this.options.multiple) {
      const ids = Array.isArray(encodedValue) ? encodedValue : [encodedValue];
      return model.getList({ ids });
    }

    const id = Array.isArray(encodedValue) ? encodedValue[0] : encodedValue;
    return model.get(id);
  }

  serialize(decodedValue: FieldRelationDefinition<any>, from: Model) {
    if (!decodedValue) {
      return decodedValue;
    }

    const canGetIds = "getIds" in decodedValue;

    if (this.options.multiple) {
      return canGetIds
        ? decodedValue.getIds()
        : [decodedValue._id].filter((_id) => typeof _id === "string");
    }

    return canGetIds ? decodedValue.getIds()[0] : decodedValue._id;
  }
}

export type FieldRelationDefinition<
  D extends {
    model: Model;
    multiple?: boolean;
    required?: boolean;
  },
  Required extends boolean = false
> = Required extends true
  ? D["multiple"] extends true
    ? ModelList<D["model"]> | PromiseModelList<D["model"]>
    : D["model"] | PromiseModelOn<D["model"]>
  : D["required"] extends true
  ? FieldRelationDefinition<D, true>
  : FieldRelationDefinition<D, true> | undefined;

export default FieldRelation;
