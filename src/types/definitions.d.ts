import type { DefaultTransactionCtx, DefaultSerializerCtx } from "@/types";

declare global {
  export type TransactionCtx = DefaultTransactionCtx;

  export type SerializerCtx = DefaultSerializerCtx;

  export type IdType = string;
}
