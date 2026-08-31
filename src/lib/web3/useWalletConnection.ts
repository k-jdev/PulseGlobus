import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useCallback } from "react";
import { useAccount, useDisconnect } from "wagmi";

import type { EvmAddress, WalletConnectionState } from "./types";

export const formatAddress = (address: EvmAddress): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export function useWalletConnection(): WalletConnectionState {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  const connect = useCallback(() => {
    open();
  }, [open]);

  return {
    address,
    isConnected,
    shortAddress: address ? formatAddress(address) : null,
    connect,
    disconnect,
  };
}
