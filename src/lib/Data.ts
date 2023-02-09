import Model from "./Model";
import { modelDecorator } from "./modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";
import { ExecutorCtx } from "../global";

@modelDecorator()
class Data extends Model {
  static extendable = true;
  static scope = ModelEnvScopes.ENV;
  static __datamodel: DataModel;
  static __modelsMap: Map<string, typeof Data> = new Map();

  static getFromDatamodel(datamodel: DataModel): typeof Data {
    let model = Data.__modelsMap.get(datamodel.slug);
    if (!model) {
      model = class extends Data {
        static __name = datamodel.name;

        static slug = datamodel.slug;
        static fields = datamodel.fields;
        static validators = [];
        static configKey = datamodel.configKey;
      };

      model.__datamodel = datamodel;

      Data.__modelsMap.set(datamodel.slug, model);
    }

    const adapter = datamodel.model.__adapter.constructor as typeof Adapter;
    return model.withAdapter(adapter);
  }

  static getFromSlug<M extends typeof Model = typeof Data>(slug: string): M {
    let model = Data.__modelsMap.get(slug);
    if (!model) {
      model = class extends Data {
        static __name = `Data<${slug}>`;

        static slug = slug;

        static async reloadModel(ctx?: ExecutorCtx) {
          if (!this.__datamodel) {
            const datamodel = await DataModel.withAdapter(
              this.__adapter.constructor as typeof Adapter
            ).get({ filter: { slug } }, ctx);

            if (datamodel) {
              this.__datamodel = datamodel;

              this.slug = datamodel.slug;
              this.fields = datamodel.fields;
              this.validators = [];
              this.configKey = datamodel.configKey;
            }
          }

          return Model.reloadModel.apply(this, [ctx]);
        }
      };

      Data.__modelsMap.set(slug, model);
    }

    return model as any as M;
  }

  [prop: string]: any;
}

export default Data;
