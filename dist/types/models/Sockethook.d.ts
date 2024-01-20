import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { AdapterFetcher, HookPhase, ModelDefinition } from "../types";
declare class Sockethook extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    name: FieldDefinitionText;
    on: FieldDefinitionText;
    phase: HookPhase;
    action: keyof AdapterFetcher;
    blocking: FieldDefinitionBoolean;
    order: FieldDefinitionNumber;
}
export default Sockethook;
