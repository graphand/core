import Adapter from "@/lib/Adapter";
import { AdapterFetcher, ModelDefinition, ModelInstance } from "@/types";
import ModelList from "@/lib/ModelList";
import Model from "@/lib/Model";
import ValidatorTypes from "@/enums/validator-types";
import defaultFieldsMap from "@/lib/defaultFieldsMap";
import defaultValidatorsMap from "@/lib/defaultValidatorsMap";
import { defineFieldsProperties } from "@/lib/utils";
import Validator from "@/lib/Validator";

const cache: Map<typeof Model, Set<ModelInstance>> = new Map();

export const mockAdapter = ({
  fieldsMap = defaultFieldsMap,
  validatorsMap = {
    ...defaultValidatorsMap,
    [ValidatorTypes.SAMPLE]: class ValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
      validate = () => Promise.resolve(true);
    },
  },
  privateCache,
}: {
  fieldsMap?: Adapter["fieldsMap"];
  validatorsMap?: Adapter["validatorsMap"];
  privateCache?: Set<ModelInstance>;
} = {}) => {
  class MockAdapter extends Adapter {
    runValidators = true;

    get thisCache(): Set<ModelInstance> {
      if (privateCache) {
        return privateCache;
      }

      const cacheKey = this.model.getBaseClass();

      let cacheModel = cache.get(cacheKey);
      if (!cacheModel) {
        cacheModel = new Set(
          Array(5)
            .fill(null)
            .map(() => this.model.fromDoc()),
        );

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
        const i = this.model.fromDoc(payload);
        this.thisCache.add(i);
        return Promise.resolve(i);
      }),
      createMultiple: jest.fn(([payload]) => {
        const created = payload.map(p => this.model.fromDoc(p));
        created.forEach(i => this.thisCache.add(i));
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
              filterEntries.every(([key, value]) => r.getDoc()[key] === value),
            );
          }
        }

        if (!found) {
          return Promise.resolve(null);
        }

        if (update.$set) {
          Object.assign(found.getDoc(), update.$set);
        }

        if (update.$unset) {
          Object.keys(update.$unset).forEach(key => {
            delete found.getDoc()[key];
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
          list.forEach(i => Object.assign(i.getDoc(), update.$set));
        }

        if (update.$unset) {
          list.forEach(i => {
            Object.keys(update.$unset).forEach(key => {
              delete i.getDoc()[key];
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

    fieldsMap = fieldsMap;
    validatorsMap = validatorsMap;
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

// export const mockModel = <D extends ModelDefinition>(
//   opts: {
//     slug?: string;
//     extendsModel?: typeof Model;
//     scope?: ModelEnvScopes;
//     allowMultipleOperations?: boolean;
//     extensible?: boolean;
//     fields?: D["fields"];
//     validators?: D["validators"];
//     single?: D["single"];
//   } = {},
// ): typeof Model & { definition: D } => {
//   const {
//     extendsModel = Model,
//     scope = ModelEnvScopes.ENV,
//     allowMultipleOperations = true,
//     extensible = false,
//     single = false,
//     fields = {
//       title: {
//         type: FieldTypes.TEXT,
//         options: { default: "test" },
//       },
//     },
//     validators = [
//       {
//         type: ValidatorTypes.SAMPLE,
//         options: {
//           field: "title",
//         },
//       },
//     ],
//   } = opts;
//   let { slug } = opts;
//   slug ??= "a" + Math.random().toString(36).substring(7);

//   class Test extends extendsModel {
//     static extensible = extensible;
//     static slug = slug;
//     static scope = scope;
//     static allowMultipleOperations = allowMultipleOperations;
//     static definition = {
//       single,
//       keyField: undefined,
//       fields,
//       validators,
//     };

//     constructor(doc) {
//       super(doc);

//       defineFieldsProperties(this);
//     }
//   }

//   return Test as typeof Model & { definition: D };
// };

export const generateRandomString = () => {
  return "a" + Math.random().toString(36).substring(7);
};
