import Adapter from "@/lib/Adapter";
import { AdapterFetcher, ModelDefinition, ModelInstance } from "@/types";
import ModelList from "@/lib/ModelList";
import Model from "@/lib/Model";
import ValidatorTypes from "@/enums/validator-types";
import { defineFieldsProperties } from "@/lib/utils";
import Validator from "@/lib/Validator";
import { ObjectId } from "bson";

const cache: Map<typeof Model, Set<ModelInstance<typeof Model>>> = new Map();

export const mockAdapter = ({
  name = "MockAdapter",
  fieldsMap = {},
  validatorsMap = {
    [ValidatorTypes.SAMPLE]: class ValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
      validate = () => Promise.resolve(true);
    },
  },
  privateCache,
}: {
  name?: string;
  fieldsMap?: typeof Adapter["fieldsMap"];
  validatorsMap?: typeof Adapter["validatorsMap"];
  privateCache?: Set<ModelInstance<typeof Model>>;
} = {}) => {
  class MockAdapter extends Adapter {
    static __name = name;
    static runWriteValidators = true;
    static fieldsMap = fieldsMap;
    static validatorsMap = validatorsMap;

    get thisCache(): Set<ModelInstance<typeof Model>> {
      if (privateCache) {
        return privateCache;
      }

      const cacheKey = this.model.getBaseClass();

      let cacheModel = cache.get(cacheKey);
      if (!cacheModel) {
        cacheModel = new Set(
          Array(5)
            .fill(null)
            .map(() => this.model.hydrate({})),
        ) as Set<ModelInstance<typeof Model>>;

        cache.set(cacheKey, cacheModel);
      }

      return cacheModel;
    }

    fetcher: AdapterFetcher = {
      count: jest.fn(() => Promise.resolve(this.thisCache.size)),
      get: jest.fn(([query]) => {
        if (!query) {
          return Promise.resolve(null);
        }

        const cache = Array.from(this.thisCache);

        if (typeof query === "string") {
          return Promise.resolve(cache.find(r => r._id === query));
        }

        let found = cache[0];

        if (query.filter) {
          const filterEntries = Object.entries(query.filter);
          found = cache.find(r => filterEntries.every(([key, value]) => r.get(key) === value));
        }

        return Promise.resolve(found);
      }),
      getList: jest.fn(() => {
        return Promise.resolve(new ModelList(this.model, Array.from(this.thisCache)));
      }),
      createOne: jest.fn(async ([payload]) => {
        payload._id ??= String(new ObjectId());
        const i = this.model.hydrate(payload);
        this.thisCache.add(i as ModelInstance<typeof Model>);
        return Promise.resolve(i);
      }),
      createMultiple: jest.fn(([payload]) => {
        const created = payload.map(p => this.model.hydrate(p));
        created.forEach(i => {
          i._id ??= String(new ObjectId());
          this.thisCache.add(i as ModelInstance<typeof Model>);
        });
        return Promise.resolve(created);
      }),
      updateOne: jest.fn(([query, update]) => {
        if (!query || !update) {
          return Promise.resolve(null);
        }

        let found;

        const cache = Array.from(this.thisCache);

        if (typeof query === "string") {
          found = cache.find(r => r._id === query);
        } else {
          found = cache[0];

          if (query.filter) {
            const filterEntries = Object.entries(query.filter);
            found = cache.find(r =>
              filterEntries.every(([key, value]) => r.getData()[key] === value),
            );
          }
        }

        if (!found) {
          return Promise.resolve(null);
        }

        if (update.$set) {
          Object.assign(found.getData(), update.$set);
        }

        if (update.$unset) {
          Object.keys(update.$unset).forEach(key => {
            delete found.getData()[key];
          });
        }

        return Promise.resolve(found);
      }),
      updateMultiple: jest.fn(([query, update]) => {
        if (!query || !update) {
          return Promise.resolve(null);
        }

        const list = Array.from(this.thisCache);

        if (update.$set) {
          list.forEach(i => Object.assign(i.getData(), update.$set));
        }

        if (update.$unset) {
          list.forEach(i => {
            Object.keys(update.$unset).forEach(key => {
              delete i.getData()[key];
            });
          });
        }

        return Promise.resolve(list);
      }),
      deleteOne: jest.fn(([query]) => {
        if (!query) {
          return Promise.resolve(null);
        }

        const [first] = Array.from(this.thisCache);
        this.thisCache.delete(first);
        return Promise.resolve(true);
      }),
      deleteMultiple: jest.fn(([query]) => {
        if (!query) {
          return Promise.resolve(null);
        }

        const ids = Array.from(this.thisCache).map(i => i._id);
        this.thisCache.clear();
        return Promise.resolve(ids);
      }),
    };
  }

  return MockAdapter;
};

export const mockModel = <D extends ModelDefinition>(def?: D): typeof Model & { definition: D } => {
  return class extends Model {
    static slug = "a" + generateRandomString();
    static definition = def;

    constructor(doc) {
      super(doc);

      defineFieldsProperties(this);
    }
  };
};

export const generateRandomString = () => {
  return "a" + Math.random().toString(36).substring(7);
};
