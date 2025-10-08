export type FiatLiquidityAdded = {
  provider: string;
  fiat_symbol: string;
  amount: bigint;
};

export type TokenLiquidityAdded = {
  provider: string;
  token_symbol: string;
  amount: bigint;
};

export type FiatDeposit = {
  user: string;
  fiat_account_id: string;
  fiat_symbol: string;
  amount: bigint;
  transaction_id: string;
};

export type FiatLiquidityRemoved = {
  provider: string;
  fiat_symbol: string;
  amount: bigint;
};

export type FiatToTokenSwapExecuted = {
  user: string;
  fiat_symbol: string;
  token_symbol: string;
  fiat_amount: bigint;
  token_amount: bigint;
  fee: bigint;
};

export type TokenToFiatSwapExecuted = {
  user: string;
  fiat_symbol: string;
  token_symbol: string;
  fiat_amount: bigint;
  token_amount: bigint;
  fee: bigint;
};

export type ExchangeRateUpdated = {
  fiat_symbol: string;
  token_symbol: string;
  new_rate: bigint;
};

export type TokenRegistered = {
  token_symbol: string;
  token_address: string;
};

export type UserRegistered = {
  user: string;
  fiat_account_id: string;
};

export type WithdrawalCompleted = {
  user: string;
  token_symbol: string;
  amount: bigint;
  fiat_reference: string;
};

export type EventArgs =
  | { _tag: "FiatLiquidityAdded"; FiatLiquidityAdded: FiatLiquidityAdded }
  | { _tag: "TokenLiquidityAdded"; TokenLiquidityAdded: TokenLiquidityAdded }
  | { _tag: "FiatDeposit"; FiatDeposit: FiatDeposit }
  | { _tag: "FiatLiquidityRemoved"; FiatLiquidityRemoved: FiatLiquidityRemoved }
  | { _tag: "FiatToTokenSwapExecuted"; FiatToTokenSwapExecuted: FiatToTokenSwapExecuted }
  | { _tag: "TokenToFiatSwapExecuted"; TokenToFiatSwapExecuted: TokenToFiatSwapExecuted }
  | { _tag: "ExchangeRateUpdated"; ExchangeRateUpdated: ExchangeRateUpdated }
  | { _tag: "TokenRegistered"; TokenRegistered: TokenRegistered }
  | { _tag: "UserRegistered"; UserRegistered: UserRegistered }
  | { _tag: "WithdrawalCompleted"; WithdrawalCompleted: WithdrawalCompleted }
  | { _tag: string;[key: string]: unknown }; // Fallback for unknown event types

