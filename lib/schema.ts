//  --- Drizzle schema for indexer state and events ----
import { bigint, pgTable, text, uuid, timestamp, json } from "drizzle-orm/pg-core";

export const cursorTable = pgTable("cursor_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  endCursor: bigint("end_cursor", { mode: "number" }),
  uniqueKey: text("unique_key"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const liquidityEvents = pgTable("liquidity_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockNumber: bigint("block_number", { mode: "number" }),
  transactionHash: text("transaction_hash"),
  eventIndex: bigint("event_index", { mode: "number" }),
  contractAddress: text("contract_address"),
  keys: json("keys"),
  data: json("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export {};
