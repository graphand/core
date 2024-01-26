export interface TransactionCtx {
  disableValidation?: boolean;
  forceOperation?: boolean;
}

export interface SerializerCtx {
  defaults?: boolean;
  outputFormat?: string;
  transactionCtx?: TransactionCtx;
}
