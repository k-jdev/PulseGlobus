import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { mainnet } from "wagmi/chains";

import { ERC20_ABI } from "./abi";
import type { TokenGateOptions, TokenGateState } from "./types";

export function useTokenGate({
  tokenAddress,
  requiredAmount,
  chainId = mainnet.id,
}: TokenGateOptions): TokenGateState {
  const { address, isConnected } = useAccount();

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    chainId,
  });

  const { data: balanceRaw, isLoading: isBalanceLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: Boolean(address) },
  });

  const balance =
    balanceRaw !== undefined && decimals !== undefined
      ? Number(formatUnits(balanceRaw, decimals))
      : 0;

  const hasAccess = balance >= requiredAmount;

  return {
    isConnected,
    hasAccess,
    balance,
    requiredAmount,
    isLoading: isBalanceLoading && !hasAccess,
    address,
  };
}
