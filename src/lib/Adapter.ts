import { AdapterFetcher, AdapterSerializer } from "../types";
import Model from "./Model";

class Adapter {
  fetcher: AdapterFetcher;
  serializer: AdapterSerializer;

  model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }
}

export default Adapter;
