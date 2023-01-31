import Model from "./Model";
import { modelDecorator } from "./modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";

@modelDecorator()
class Data extends Model {
  static extendable = true;
  static scope = ModelEnvScopes.ENV;
  static __datamodel: DataModel;

  static getFromDatamodel(datamodel: DataModel) {
    const model = class extends Data {
      static __name = datamodel.name;

      static slug = datamodel.slug;
      static fields = datamodel.fields;
      static validators = [];
      static configKey = datamodel.configKey;
    };

    model.__datamodel = datamodel;

    const adapter = datamodel.model.__adapter.constructor as typeof Adapter;
    return model.withAdapter(adapter);
  }

  static getFromSlug(slug: string) {
    const model = class extends Data {
      static __name = `Data<${slug}>`;

      static slug = slug;
    };

    return model;
  }

  [prop: string]: any;
}

export default Data;
