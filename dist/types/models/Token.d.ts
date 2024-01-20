import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import Role from "./Role";
import { ModelDefinition } from "../types";
declare class Token extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    name: FieldDefinitionText;
    expiration: FieldDefinitionDate;
    lifetime: FieldDefinitionNumber;
    maxGen: FieldDefinitionNumber;
    role: FieldDefinitionRelation<Role>;
    _generation: FieldDefinitionNumber;
}
export default Token;
