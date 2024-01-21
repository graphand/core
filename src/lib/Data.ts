import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import ModelEnvScopes from "@/enums/model-env-scopes";

/**
 * The Data class is a specific that is the base class for all data models.
 * When a new datamodel is created, the class to process the data of it will extend this class with the datamodel slug as slug.
 */
@modelDecorator()
class Data extends Model {
  static searchable = true;
  static extensible = true; // A data class is extensible as it should be linked to a datamodel with the same slug
  static scope = ModelEnvScopes.ENV;
}

export default Data;
