import Model from "./Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import DataModel from "../models/DataModel";
import Adapter from "./Adapter";
/**
 * The Data class is a specific that is the base class for all data models.
 * When a new datamodel is created, the class to process the data of it will extend this class with the datamodel slug as slug.
 */
declare class Data extends Model {
    static searchable: boolean;
    static extensible: boolean;
    static scope: ModelEnvScopes;
    /**
     * Get a usable Data class from a specific slug.
     * @param slug the slug of the datamodel
     * @param adapterClass the adapter to use with
     * @returns the new class extending Data and with the slug as slug
     * @example
     * const Post = Data.__getFromSlug("posts", MyAdapterClass);
     * const newPost = await Post.create({}); // Will use MyAdapterClass
     */
    static __getFromSlug<M extends typeof Model = typeof Data>(slug: string, adapterClass?: typeof Adapter): M;
    static getFromDatamodel(datamodel: DataModel, adapterClass?: typeof Adapter | false): typeof Data;
    [prop: string]: any;
}
export default Data;
