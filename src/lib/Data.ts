import Model from "./Model";
import { modelDecorator } from "./modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";
import CoreError from "./CoreError";
import ErrorCodes from "../enums/error-codes";

@modelDecorator()
class Data extends Model {
  static extendable = true;
  static scope = ModelEnvScopes.ENV;

  static getFromDatamodel(
    datamodel: DataModel,
    adapter?: typeof Adapter
  ): typeof Data {
    if (!adapter) {
      adapter = datamodel.model.__adapter?.constructor as typeof Adapter;
    }

    if (adapter) {
      adapter.__modelsMap ??= new Map();
    }

    let model = class extends Data {
      static __name = datamodel.name;

      static isPage = datamodel.isPage;
      static slug = datamodel.slug;
      static fields = datamodel.fields;
      static validators = [];
      static configKey = datamodel.configKey || undefined;
    };

    if (adapter) {
      model = model.withAdapter(adapter);
    }

    adapter?.__modelsMap.set(datamodel.slug, model);

    return model;
  }

  static __getFromSlug<M extends typeof Model = typeof Data>(
    slug: string,
    adapter?: typeof Adapter
  ): M {
    if (adapter) {
      adapter.__modelsMap ??= new Map();
    }

    let model: typeof Data = adapter?.__modelsMap.get(slug) as typeof Data;

    if (!model) {
      model = class extends Data {
        static __name = `Data<${slug}>`;

        static slug = slug;
      };

      if (adapter) {
        model = model.withAdapter(adapter);
      }

      adapter?.__modelsMap.set(slug, model);
    }

    return model as any as M;
  }

  [prop: string]: any;
}

export default Data;
