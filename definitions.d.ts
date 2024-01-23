import type { DefaultTransactionCtx, DefaultSerializerCtx } from "@graphand/core";

declare global {
  export type TransactionCtx = DefaultTransactionCtx;

  export type SerializerCtx = DefaultSerializerCtx;

  export type IdType = string;
}
