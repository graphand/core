import { ModelJSON } from "@/types";
import Model from "./lib/Model";

declare global {
  type ModelData<M extends typeof Model = typeof Model> = ModelJSON<M>;
}

export {};
