import Model from "./Model";
import { modelDecorator } from "./modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";
import { assignDatamodel, getModelInitPromise } from "./utils";

/**
 * The Data class is a specific that is the base class for all data models.
 * When a new datamodel is created, the class to process the data of it will extend this class with the datamodel slug as slug.
 */
@modelDecorator()
class Data extends Model {
  static searchable = true;
  static extensible = true; // A data class is extensible as it should be linked to a datamodel with the same slug
  static scope = ModelEnvScopes.ENV;

  /**
   * Get a usable Data class from a specific slug.
   * @param slug the slug of the datamodel
   * @param adapterClass the adapter to use with
   * @returns the new class extending Data and with the slug as slug
   * @example
   * const Post = Data.__getFromSlug("posts", MyAdapterClass);
   * const newPost = await Post.create({}); // Will use MyAdapterClass
   */
  static __getFromSlug<M extends typeof Model = typeof Data>(
    slug: string,
    adapterClass?: typeof Adapter
  ): M {
    let model: typeof Data = adapterClass?.modelsMap.get(slug) as typeof Data;

    if (!model) {
      model = class extends Data {
        static __name = `Data<${slug}>`;

        static slug = slug;
      };

      if (adapterClass) {
        model = model.withAdapter(adapterClass);

        adapterClass.modelsMap.set(slug, model);
      }
    }

    return model as any as M;
  }

  static getFromDatamodel(
    datamodel: DataModel,
    adapterClass?: typeof Adapter | false
  ): typeof Data {
    let model = class extends Data {
      static __name = datamodel.name;

      static slug = datamodel.slug;
    };

    adapterClass ??= datamodel.model.getAdapter(false)?.base;

    if (adapterClass) {
      model = model.withAdapter(adapterClass);
      adapterClass.modelsMap.set(datamodel.slug, model);
    }

    assignDatamodel(model, datamodel);

    if (adapterClass) {
      model.__initPromise = getModelInitPromise(model, { datamodel });
    }

    return model;
  }

  [prop: string]: any;
}

export default Data;
