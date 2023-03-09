import Model from "./Model";
import { modelDecorator } from "./modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";
import { ExecutorCtx } from "../global";
import CoreError from "./CoreError";
import ErrorCodes from "../enums/error-codes";

@modelDecorator()
class Data extends Model {
  static extendable = true;
  static scope = ModelEnvScopes.ENV;
  static __datamodel: DataModel;

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

      static slug = datamodel.slug;
      static fields = datamodel.fields;
      static validators = [];
      static configKey = datamodel.configKey;
    };

    model.__datamodel = datamodel;

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

        static async reloadModel(ctx?: ExecutorCtx) {
          if (!this.__datamodel) {
            if (!this.__adapter) {
              throw new CoreError({
                code: ErrorCodes.INVALID_MODEL_ADAPTER,
                message: `model ${this.slug} is initialized without adapter`,
              });
            }

            const adapter = this.__adapter.constructor as typeof Adapter;
            const datamodel = await DataModel.withAdapter(adapter).get(
              { filter: { slug } },
              ctx
            );

            if (!datamodel) {
              throw new CoreError({
                code: ErrorCodes.INVALID_MODEL_SLUG,
                message: `model with slug ${slug} does no exist`,
              });
            }

            this.__datamodel = datamodel;

            this.slug = datamodel.slug;
            this.fields = datamodel.fields;
            this.validators = [];
            this.configKey = datamodel.configKey;
          }

          return Model.reloadModel.apply(this, [ctx]);
        }
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
