import Adapter from "./Adapter";
import { AdapterFetcher, FieldsDefinition, ValidatorsDefinition } from "../types";
import FieldTypes from "../enums/field-types";
import ModelEnvScopes from "../enums/model-env-scopes";
import Model from "./Model";
import ValidatorTypes from "../enums/validator-types";
import Validator from "./Validator";
export declare const mockAdapter: ({ fieldsMap, validatorsMap, }?: {
    fieldsMap?: Adapter["fieldsMap"];
    validatorsMap?: Adapter["validatorsMap"];
}) => {
    new (model: typeof Model): {
        runValidators: boolean;
        readonly thisCache: Set<any>;
        fetcher: AdapterFetcher;
        fieldsMap: {
            id?: {
                new (definition: {
                    type: FieldTypes.ID;
                    options?: Record<string, never>;
                }, path: string): import("./Field").default<FieldTypes.ID>;
            };
            array?: {
                new (definition: {
                    type: FieldTypes.ARRAY;
                    options?: {
                        items: {
                            type: FieldTypes.ID;
                            options?: Record<string, never>;
                        } | any | {
                            type: FieldTypes.TEXT;
                            options?: {
                                default?: string;
                                options?: string[];
                                strict?: boolean;
                            };
                        } | {
                            type: FieldTypes.NUMBER;
                            options?: {
                                default?: number;
                            };
                        } | {
                            type: FieldTypes.BOOLEAN;
                            options?: {
                                default?: boolean;
                            };
                        } | {
                            type: FieldTypes.RELATION;
                            options?: {
                                ref: string;
                            };
                        } | {
                            type: FieldTypes.DATE;
                            options?: Record<string, never>;
                        } | {
                            type: FieldTypes.NESTED;
                            options?: {
                                default?: {
                                    [key: string]: any;
                                };
                                defaultField?: {
                                    type: FieldTypes.ID;
                                    options?: Record<string, never>;
                                } | any | {
                                    type: FieldTypes.TEXT;
                                    options?: {
                                        default?: string;
                                        options?: string[];
                                        strict?: boolean;
                                    };
                                } | {
                                    type: FieldTypes.NUMBER;
                                    options?: {
                                        default?: number;
                                    };
                                } | {
                                    type: FieldTypes.BOOLEAN;
                                    options?: {
                                        default?: boolean;
                                    };
                                } | {
                                    type: FieldTypes.RELATION;
                                    options?: {
                                        ref: string;
                                    };
                                } | {
                                    type: FieldTypes.DATE;
                                    options?: Record<string, never>;
                                } | any | {
                                    type: FieldTypes.IDENTITY;
                                    options?: Record<string, never>;
                                };
                                fields?: FieldsDefinition;
                                strict?: boolean;
                                validators?: ValidatorsDefinition;
                            };
                        } | {
                            type: FieldTypes.IDENTITY;
                            options?: Record<string, never>;
                        };
                        validators?: import("../types").ValidatorsDefinitionOmitField;
                    };
                }, path: string): import("./Field").default<FieldTypes.ARRAY>;
            };
            text?: {
                new (definition: {
                    type: FieldTypes.TEXT;
                    options?: {
                        default?: string;
                        options?: string[];
                        strict?: boolean;
                    };
                }, path: string): import("./Field").default<FieldTypes.TEXT>;
            };
            number?: {
                new (definition: {
                    type: FieldTypes.NUMBER;
                    options?: {
                        default?: number;
                    };
                }, path: string): import("./Field").default<FieldTypes.NUMBER>;
            };
            boolean?: {
                new (definition: {
                    type: FieldTypes.BOOLEAN;
                    options?: {
                        default?: boolean;
                    };
                }, path: string): import("./Field").default<FieldTypes.BOOLEAN>;
            };
            relation?: {
                new (definition: {
                    type: FieldTypes.RELATION;
                    options?: {
                        ref: string;
                    };
                }, path: string): import("./Field").default<FieldTypes.RELATION>;
            };
            date?: {
                new (definition: {
                    type: FieldTypes.DATE;
                    options?: Record<string, never>;
                }, path: string): import("./Field").default<FieldTypes.DATE>;
            };
            nested?: {
                new (definition: {
                    type: FieldTypes.NESTED;
                    options?: {
                        default?: {
                            [key: string]: any;
                        };
                        defaultField?: {
                            type: FieldTypes.ID;
                            options?: Record<string, never>;
                        } | {
                            type: FieldTypes.ARRAY;
                            options?: {
                                items: {
                                    type: FieldTypes.ID;
                                    options?: Record<string, never>;
                                } | any | {
                                    type: FieldTypes.TEXT;
                                    options?: {
                                        default?: string;
                                        options?: string[];
                                        strict?: boolean;
                                    };
                                } | {
                                    type: FieldTypes.NUMBER;
                                    options?: {
                                        default?: number;
                                    };
                                } | {
                                    type: FieldTypes.BOOLEAN;
                                    options?: {
                                        default?: boolean;
                                    };
                                } | {
                                    type: FieldTypes.RELATION;
                                    options?: {
                                        ref: string;
                                    };
                                } | {
                                    type: FieldTypes.DATE;
                                    options?: Record<string, never>;
                                } | any | {
                                    type: FieldTypes.IDENTITY;
                                    options?: Record<string, never>;
                                };
                                validators?: import("../types").ValidatorsDefinitionOmitField;
                            };
                        } | {
                            type: FieldTypes.TEXT;
                            options?: {
                                default?: string;
                                options?: string[];
                                strict?: boolean;
                            };
                        } | {
                            type: FieldTypes.NUMBER;
                            options?: {
                                default?: number;
                            };
                        } | {
                            type: FieldTypes.BOOLEAN;
                            options?: {
                                default?: boolean;
                            };
                        } | {
                            type: FieldTypes.RELATION;
                            options?: {
                                ref: string;
                            };
                        } | {
                            type: FieldTypes.DATE;
                            options?: Record<string, never>;
                        } | any | {
                            type: FieldTypes.IDENTITY;
                            options?: Record<string, never>;
                        };
                        fields?: FieldsDefinition;
                        strict?: boolean;
                        validators?: ValidatorsDefinition;
                    };
                }, path: string): import("./Field").default<FieldTypes.NESTED>;
            };
            identity?: {
                new (definition: {
                    type: FieldTypes.IDENTITY;
                    options?: Record<string, never>;
                }, path: string): import("./Field").default<FieldTypes.IDENTITY>;
            };
        };
        validatorsMap: {
            required?: {
                new (definition: {
                    type: ValidatorTypes.REQUIRED;
                    options: {
                        field: string;
                    };
                }, path?: string): Validator<ValidatorTypes.REQUIRED>;
            };
            unique?: {
                new (definition: {
                    type: ValidatorTypes.UNIQUE;
                    options: {
                        field: string;
                    };
                }, path?: string): Validator<ValidatorTypes.UNIQUE>;
            };
            boundaries?: {
                new (definition: {
                    type: ValidatorTypes.BOUNDARIES;
                    options: {
                        field: string;
                        min?: number;
                        max?: number;
                    };
                }, path?: string): Validator<ValidatorTypes.BOUNDARIES>;
            };
            length?: {
                new (definition: {
                    type: ValidatorTypes.LENGTH;
                    options: {
                        field: string;
                        min?: number;
                        max?: number;
                    };
                }, path?: string): Validator<ValidatorTypes.LENGTH>;
            };
            regex?: {
                new (definition: {
                    type: ValidatorTypes.REGEX;
                    options: {
                        field: string;
                        pattern: string;
                        options?: ("i" | "m" | "s" | "u" | "y")[];
                    };
                }, path?: string): Validator<ValidatorTypes.REGEX>;
            };
            sample?: {
                new (definition: {
                    type: ValidatorTypes.SAMPLE;
                    options: {
                        field: string;
                    };
                }, path?: string): Validator<ValidatorTypes.SAMPLE>;
            };
            keyField?: {
                new (definition: {
                    type: ValidatorTypes.KEY_FIELD;
                    options: {
                        field: string;
                    };
                }, path?: string): Validator<ValidatorTypes.KEY_FIELD>;
            };
            datamodelSlug?: {
                new (definition: {
                    type: ValidatorTypes.DATAMODEL_SLUG;
                    options?: Record<string, never>;
                }, path?: string): Validator<ValidatorTypes.DATAMODEL_SLUG>;
            };
            datamodelDefinition?: {
                new (definition: {
                    type: ValidatorTypes.DATAMODEL_DEFINITION;
                    options?: Record<string, never>;
                }, path?: string): Validator<ValidatorTypes.DATAMODEL_DEFINITION>;
            };
        };
        model: typeof Model;
        readonly base: typeof Adapter;
    };
    _modelsMap: Map<string, typeof Model>;
    readonly modelsMap: Map<string, typeof Model>;
};
export declare const mockModel: ({ slug, extendsModel, scope, allowMultipleOperations, extensible, single, fields, validators, }?: {
    slug?: string;
    extendsModel?: typeof Model;
    scope?: ModelEnvScopes;
    allowMultipleOperations?: boolean;
    extensible?: boolean;
    fields?: FieldsDefinition;
    validators?: ValidatorsDefinition;
    single?: boolean;
}) => {
    new (doc: any): {
        [slug: string]: any;
        "__#10@#doc": import("../types").DocumentDefinition;
        _id: string;
        _createdAt: Date;
        _createdBy: any;
        _updatedAt: Date;
        _updatedBy: any;
        readonly model: typeof Model;
        getDoc(): import("../types").DocumentDefinition;
        getKey(format?: string): any;
        getId(format?: string): any;
        setDoc(doc: any): void;
        clone(): Model;
        get(path: string, format?: string, bindCtx?: Partial<import("../types").DefaultSerializerCtx>, value?: any): any;
        set<T extends Model, S extends string | keyof T>(this: T, path: S, value: S extends keyof T ? any : any, ctx?: import("../types").DefaultTransactionCtx): any;
        serialize(format: string, bindCtx?: Partial<import("../types").DefaultSerializerCtx>, clean?: boolean, fieldsKeys?: string[]): any;
        toJSON(): any;
        toObject(): any;
        toDocument(): any;
        toString(): string;
        update(update: any, ctx?: import("../types").DefaultTransactionCtx): Promise<any>;
        delete(ctx?: import("../types").DefaultTransactionCtx): Promise<any>;
    };
    extensible: boolean;
    slug: string;
    scope: ModelEnvScopes;
    allowMultipleOperations: boolean;
    definition: {
        single: boolean;
        keyField: any;
        fields: FieldsDefinition;
        validators: ValidatorsDefinition;
    };
    searchable: boolean;
    exposed: boolean;
    systemFields: boolean;
    controllersScope: "global" | "project";
    freeMode: boolean;
    adapterClass: typeof Adapter;
    __name: string;
    __hooks: Set<import("../types").Hook<any, any, any>>;
    __initOptions: {
        datamodel?: import("../models/DataModel").default;
        ctx?: import("../types").DefaultTransactionCtx;
    };
    __initPromise: Promise<void>;
    __adapter: Adapter;
    __fieldsMap: Map<string, import("./Field").default<FieldTypes>>;
    __validatorsArray: Validator<ValidatorTypes>[];
    __fieldsKeys: string[];
    __fieldsProperties: any;
    __baseClass: typeof Model;
    __dm: string;
    isSingle(): boolean;
    getKeyField(): string;
    clone<T_1 extends typeof Model>(this: T_1, initOptions?: {
        datamodel?: import("../models/DataModel").default;
        ctx?: import("../types").DefaultTransactionCtx;
    }): T_1;
    getBaseClass<T_2 extends typeof Model>(this: T_2): T_2;
    withAdapter<T_3 extends typeof Model>(this: T_3, adapterClass: typeof Adapter, modules?: import("../types").Module[]): T_3;
    initialize(): Promise<void>;
    reloadModel(opts?: {
        datamodel?: import("../models/DataModel").default;
        ctx?: import("../types").DefaultTransactionCtx;
    }): Promise<import("../models/DataModel").default>;
    readonly fieldsMap: Map<string, import("./Field").default<FieldTypes>>;
    readonly fieldsKeys: string[];
    readonly validatorsArray: Validator<ValidatorTypes>[];
    getFromSlug<M extends typeof Model = typeof Model>(slug: string, adapter?: typeof Adapter, fallbackData?: boolean): M;
    fromString<T_4 extends typeof Model>(this: T_4, str: string, cleanPayload?: boolean): InstanceType<T_4>;
    count<T_5 extends typeof Model>(this: T_5, query?: string | import("../types").JSONQuery, ctx?: import("../types").DefaultTransactionCtx): Promise<number>;
    get<T_6 extends typeof Model>(this: T_6, query?: string | import("../types").JSONQuery, ctx?: import("../types").DefaultTransactionCtx): import("./PromiseModel").default<InstanceType<T_6>>;
    getList<T_7 extends typeof Model>(this: T_7, query?: import("../types").JSONQuery, ctx?: import("../types").DefaultTransactionCtx): import("./PromiseModelList").default<InstanceType<T_7>>;
    create<T_8 extends typeof Model>(this: T_8, payload: Partial<Omit<import("../types").ModelDocument<InstanceType<T_8>>, import("../types").ModelDocumentBaseFields>>, ctx?: import("../types").DefaultTransactionCtx): Promise<InstanceType<T_8>>;
    createMultiple<T_9 extends typeof Model>(this: T_9, payload: Partial<Omit<import("../types").ModelDocument<InstanceType<T_9>>, import("../types").ModelDocumentBaseFields>>[], ctx?: import("../types").DefaultTransactionCtx): Promise<InstanceType<T_9>[]>;
    update<T_10 extends typeof Model>(this: T_10, query: string | import("../types").JSONQuery, update: any, ctx?: import("../types").DefaultTransactionCtx): Promise<InstanceType<T_10>[]>;
    delete<T_11 extends typeof Model>(this: T_11, query?: string | import("../types").JSONQuery, ctx?: import("../types").DefaultTransactionCtx): Promise<string[]>;
    hook<P extends import("../types").HookPhase, A extends keyof AdapterFetcher, T_12 extends typeof Model>(this: T_12, phase: P, action: A, fn: (args: import("../types").HookCallbackArgs<P, A, T_12>) => void, order?: number): void;
    validate<T_13 extends typeof Model>(this: T_13, list: (InstanceType<T_13> | Partial<Omit<import("../types").ModelDocument<InstanceType<T_13>>, import("../types").ModelDocumentBaseFields>>)[], ctx?: import("../types").DefaultTransactionCtx): Promise<boolean>;
    getAdapter<T_14 extends typeof Model>(this: T_14, required?: boolean): any;
    hasAdapterClassChanged<T_15 extends typeof Model>(this: T_15): boolean;
    executeHooks<M_1 extends typeof Model, P_1 extends import("../types").HookPhase, A_1 extends keyof AdapterFetcher<M_1>>(this: M_1, phase: P_1, action: A_1, payload: import("../types").HookCallbackArgs<P_1, A_1, M_1>, abortToken?: symbol): Promise<void>;
    execute<M_2 extends typeof Model, A_2 extends keyof AdapterFetcher<M_2>, Args extends Parameters<AdapterFetcher[A_2]>[0]>(this: M_2, action: A_2, args: Args, bindCtx?: import("../types").DefaultTransactionCtx): Promise<ReturnType<AdapterFetcher<M_2>[A_2]>>;
};
export declare const generateRandomString: () => string;
