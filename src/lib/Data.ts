import Model from "./Model";
import { modelDecorator } from "./modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";

@modelDecorator()
class Data extends Model {
  static extendable = true;
  static scope = ModelEnvScopes.ENV;

  static getFromDatamodel(
    datamodel: DataModel,
    adapterClass?: typeof Adapter
  ): typeof Data {
    if (!adapterClass) {
      adapterClass = datamodel.model.getAdapter(false)?.base;
    }

    let model = class extends Data {
      static __name = datamodel.name;

      static isPage = datamodel.isPage;
      static slug = datamodel.slug;
      static fields = datamodel.fields;
      static validators = [];
      static configKey = datamodel.configKey || undefined;
    };

    if (adapterClass) {
      model = model.withAdapter(adapterClass);

      adapterClass.__modelsMap ??= new Map();
      adapterClass.__modelsMap.set(datamodel.slug, model);
    }

    return model;
  }

  static __getFromSlug<M extends typeof Model = typeof Data>(
    slug: string,
    adapterClass?: typeof Adapter
  ): M {
    let model: typeof Data = adapterClass?.__modelsMap?.get(
      slug
    ) as typeof Data;

    if (!model) {
      model = class extends Data {
        static __name = `Data<${slug}>`;

        static slug = slug;
      };

      if (adapterClass) {
        model = model.withAdapter(adapterClass);

        adapterClass.__modelsMap ??= new Map();
        adapterClass.__modelsMap.set(slug, model);
      }
    }

    return model as any as M;
  }

  [prop: string]: any;
}

export default Data;
