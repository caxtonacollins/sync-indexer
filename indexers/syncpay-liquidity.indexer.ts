import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";
import { drizzleStorage } from "@apibara/plugin-drizzle";
import { drizzle } from "@apibara/plugin-drizzle";
import { StarknetStream, decodeEvent } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import * as schema from "../lib/schema";
import type { Abi, Event } from "@apibara/starknet";
import axios from "axios";
import contractAbi from "../abis/liquidityAbi.json";
import { felt252ToString } from "lib/utils";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl, contractAddress, backendUrl } =
    runtimeConfig["syncpayLiquidity"] as any;
  const db = drizzle({
    schema,
  });

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: contractAddress as `0x${string}`,
          includeTransaction: true,
          includeReceipt: true,
          includeSiblings: true,
        },
      ],
    },
    plugins: [
      drizzleStorage({ db, migrate: { migrationsFolder: "./drizzle" } }),
    ],
    async transform({ endCursor, finality, block }) {
      const logger = useLogger();

      logger.info(
        "Transforming block | orderKey: ",
        endCursor?.orderKey,
        " | finality: ",
        finality
      );

      const { events, header } = block as any;
      logger.log(`Block number ${header?.blockNumber}`);
      let extractedEventData: any[] = [];

      // Process each event in the block
      for (const event of events as Event[]) {
        logger.log(`Event ${event.eventIndex} txHash=${event.transactionHash}`);

        try {
          // Try to decode with each event type until one succeeds
          // Using full event paths from ABI for more reliable matching
          const eventTypes = [
            "isyncpayment::events::liquidityBridgeEvents::FiatLiquidityAdded",
            "isyncpayment::events::liquidityBridgeEvents::TokenLiquidityAdded",
            "isyncpayment::events::liquidityBridgeEvents::FiatLiquidityRemoved",
            "isyncpayment::events::liquidityBridgeEvents::FiatDeposit",
            "isyncpayment::events::liquidityBridgeEvents::FiatToTokenSwapExecuted",
            "isyncpayment::events::liquidityBridgeEvents::TokenToFiatSwapExecuted",
            "isyncpayment::events::liquidityBridgeEvents::ExchangeRateUpdated",
            "isyncpayment::events::liquidityBridgeEvents::TokenRegistered",
            "isyncpayment::events::liquidityBridgeEvents::UserRegistered",
            "isyncpayment::events::liquidityBridgeEvents::WithdrawalCompleted",
          ];

          // Also try with just the simple names as fallback
          const simpleEventNames = [
            "FiatLiquidityAdded",
            "TokenLiquidityAdded",
            "FiatLiquidityRemoved",
            "FiatDeposit",
            "FiatToTokenSwapExecuted",
            "TokenToFiatSwapExecuted",
            "ExchangeRateUpdated",
            "TokenRegistered",
            "UserRegistered",
            "WithdrawalCompleted",
          ];
          
          let decoded = null;
          let matchedEventName = null;

          // Try each event type with full path first
          for (const eventType of [...eventTypes, ...simpleEventNames]) {
            try {
              const result = decodeEvent({
                abi: contractAbi as Abi,
                event,
                eventName: eventType,
                strict: false,
              });

              if (result) {
                decoded = result;
                // Use the simple name for the event
                matchedEventName = eventType.includes('::')
                  ? eventType.split('::').pop()
                  : eventType;
                logger.log(`Successfully matched event type: ${eventType} as ${matchedEventName}`);
                break;
              }
            } catch (e) {
              // Log detailed error for debugging
              if (e instanceof Error) {
                logger.debug(`Failed to decode with ${eventType}: ${e.message}`);
              }
              continue;
            }
          }

          if (!decoded || !matchedEventName) {
            logger.warn(`Could not decode event at index ${event.eventIndex}`);
            logger.warn(`Event keys: ${event.keys?.map(k => k.toString()).join(', ')}`);
            continue;
          }

          logger.log(`Successfully decoded event: ${matchedEventName}`);

          // Base event data structure
          const baseEventData = {
            blockNumber: header?.blockNumber?.toString(),
            blockTimestamp: header?.timestamp
              ? new Date(Number(header.timestamp) * 1000).toISOString()
              : null,
            transactionHash: event.transactionHash,
            transactionIndex: event.transactionIndex?.toString(),
            transactionStatus: event.transactionStatus,
            eventIndex: event.eventIndex.toString(),
            eventIndexInTransaction: event.eventIndexInTransaction?.toString(),
            contractAddress: event.address,
            eventName: matchedEventName,
          };

          let formattedEventData: any = {
            ...baseEventData,
            eventName: matchedEventName,
            data: {
              name: matchedEventName, // Backend expects this
            },
          };

          const args = decoded.args as any;

          // Format event data based on event type
          switch (matchedEventName) {
            case "FiatLiquidityAdded": {
              formattedEventData.data = {
                name: matchedEventName,
                provider: args.provider,
                fiat_symbol: felt252ToString(args.fiat_symbol),
                amount: args.amount.toString(),
                amount_formatted: (Number(args.amount) / 1e18).toFixed(6),
              };
              logger.log(
                `Fiat Liquidity Added: ${formattedEventData.data.fiat_symbol} - ${formattedEventData.data.amount_formatted}`
              );
              break;
            }

            case "TokenLiquidityAdded": {
              formattedEventData.data = {
                name: matchedEventName,
                provider: args.provider,
                token_symbol: felt252ToString(args.token_symbol),
                amount: args.amount.toString(),
                amount_formatted: (Number(args.amount) / 1e18).toFixed(6),
              };
              logger.log(
                `Token Liquidity Added: ${formattedEventData.data.token_symbol} - ${formattedEventData.data.amount_formatted}`
              );
              break;
            }

            case "FiatDeposit": {
              formattedEventData.data = {
                name: matchedEventName,
                user: args.user,
                fiat_account_id: felt252ToString(args.fiat_account_id),
                fiat_symbol: felt252ToString(args.fiat_symbol),
                amount: args.amount.toString(),
                amount_formatted: (Number(args.amount) / 1e18).toFixed(6),
                transaction_id: felt252ToString(args.transaction_id),
              };
              logger.log(
                `Fiat Deposit: ${formattedEventData.data.fiat_symbol} - ${formattedEventData.data.amount_formatted}`
              );
              break;
            }

            case "FiatLiquidityRemoved": {
              formattedEventData.data = {
                name: matchedEventName,
                provider: args.provider,
                fiat_symbol: felt252ToString(args.fiat_symbol),
                amount: args.amount.toString(),
                amount_formatted: (Number(args.amount) / 1e18).toFixed(6),
              };
              logger.log(
                `Fiat Liquidity Removed: ${formattedEventData.data.fiat_symbol} - ${formattedEventData.data.amount_formatted}`
              );
              break;
            }

            case "TokenToFiatSwapExecuted": {
              formattedEventData.data = {
                name: matchedEventName,
                user: args.user,
                swap_order_id: args.swap_order_id.toString(),
                fiat_symbol: felt252ToString(args.fiat_symbol),
                token_symbol: felt252ToString(args.token_symbol),
                token_amount: BigInt(args.token_amount).toString(),
                fiat_amount: BigInt(args.fiat_amount).toString(),
                fee: BigInt(args.fee).toString(),
                token_amount_formatted: (BigInt(args.token_amount) / BigInt(1e18)).toString(),
                fiat_amount_formatted: (BigInt(args.fiat_amount) / BigInt(1e18)).toString(),
                fee_formatted: (BigInt(args.fee) / BigInt(1e18)).toString(),
              };
              logger.log(
                `Token to Fiat Swap: ${formattedEventData.data.token_amount_formatted} ${formattedEventData.data.token_symbol} -> ${formattedEventData.data.fiat_amount_formatted} ${formattedEventData.data.fiat_symbol}`
              );
              break;
            }

            case "ExchangeRateUpdated": {
              formattedEventData.data = {
                name: matchedEventName,
                fiat_symbol: felt252ToString(args.fiat_symbol),
                token_symbol: felt252ToString(args.token_symbol),
                new_rate: args.new_rate.toString(),
                new_rate_formatted: (Number(args.new_rate) / 1e18).toFixed(6),
              };
              logger.log(
                `Exchange Rate Updated: ${formattedEventData.data.fiat_symbol}/${formattedEventData.data.token_symbol} = ${formattedEventData.data.new_rate_formatted}`
              );
              break;
            }

            case "TokenRegistered": {
              formattedEventData.data = {
                name: matchedEventName,
                token_symbol: felt252ToString(args.token_symbol),
                token_address: args.token_address,
              };
              logger.log(
                `Token Registered: ${formattedEventData.data.token_symbol} at ${formattedEventData.data.token_address}`
              );
              break;
            }

            case "UserRegistered": {
              formattedEventData.data = {
                name: matchedEventName,
                user: args.user,
                fiat_account_id: args.fiat_account_id.toString(),
              };
              logger.log(
                `User Registered: ${formattedEventData.data.user} with account ${formattedEventData.data.fiat_account_id}`
              );
              break;
            }

            case "WithdrawalCompleted": {
              formattedEventData.data = {
                name: matchedEventName,
                user: args.user,
                token_symbol: felt252ToString(args.token_symbol),
                amount: args.amount.toString(),
                amount_formatted: (Number(args.amount) / 1e18).toFixed(6),
                fiat_reference: felt252ToString(args.fiat_reference),
              };
              logger.log(
                `Withdrawal Completed: ${formattedEventData.data.amount_formatted} ${formattedEventData.data.token_symbol}`
              );
              break;
            }

            default:
              logger.warn(`Unknown event type: ${matchedEventName}`);
              formattedEventData.data = {
                name: matchedEventName,
                ...args,
              };
          }

          // logger.info(`Event decoded: ${JSON.stringify(formattedEventData)}`);

          extractedEventData.push(formattedEventData);
        } catch (err) {
          logger.error(
            `Failed to process event at index ${event.eventIndex}`,
            err as Error
          );

          // Include failed events with raw data for debugging
          extractedEventData.push({
            blockNumber: header?.blockNumber?.toString(),
            blockTimestamp: header?.timestamp
              ? new Date(Number(header.timestamp) * 1000).toISOString()
              : null,
            transactionHash: event.transactionHash,
            eventIndex: event.eventIndex.toString(),
            contractAddress: event.address,
            eventName: "DecodingFailed",
            data: {
              name: "DecodingFailed",
              error: (err as Error).message,
            },
            rawKeys: event.keys?.map((k) => k.toString()) || [],
            rawData: event.data?.map((d) => d.toString()) || [],
          });
        }
      }

      // Send formatted events to backend
      if (extractedEventData.length > 0) {
        try {
          await axios.post(
            `${backendUrl}/contract/events`,
            {
              events: extractedEventData,
              blockNumber: header?.blockNumber?.toString(),
              timestamp: header?.timestamp
                ? new Date(Number(header.timestamp) * 1000).toISOString()
                : null,
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000,
            }
          );
          logger.info(
            `Successfully sent ${extractedEventData.length} events to backend for block ${header?.blockNumber}`
          );
        } catch (err) {
          logger.error("Failed to POST events to backend", err as Error);
          // implement retry logic or dead letter queue
        }
      }
    },
  });
}