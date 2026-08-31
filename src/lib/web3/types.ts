export type EvmAddress = `0x${string}`;

export interface TokenGateOptions {
  tokenAddress: EvmAddress;
  requiredAmount: number;
  chainId?: number;
}

export interface TokenGateState {
  isConnected: boolean;
  hasAccess: boolean;
  balance: number;
  requiredAmount: number;
  isLoading: boolean;
  address: EvmAddress | undefined;
}

export interface WalletConnectionState {
  address: EvmAddress | undefined;
  isConnected: boolean;
  shortAddress: string | null;
  connect: () => void;
  disconnect: () => void;
}
