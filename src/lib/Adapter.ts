import { AdapterFetcher, AdapterSerializer, AdapterValidator } from "../types";
import Model from "./Model";

class Adapter {
  fetcher: AdapterFetcher;
  serializer: AdapterSerializer;
  validator: AdapterValidator;

  model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }
}

export default Adapter;
