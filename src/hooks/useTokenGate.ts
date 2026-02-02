import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { mainnet } from "wagmi/chains";

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface UseTokenGateOptions {
  tokenAddress: `0x${string}`;
  requiredAmount: number;
  chainId?: number;
}

export interface UseTokenGateResult {
  isConnected: boolean;
  hasAccess: boolean;
  balance: number;
  requiredAmount: number;
  isLoading: boolean;
  address: `0x${string}` | undefined;
}

export function useTokenGate({
  tokenAddress,
  requiredAmount,
  chainId = mainnet.id,
}: UseTokenGateOptions): UseTokenGateResult {
  const { address, isConnected } = useAccount();
  console.log(address)

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    chainId,
  });

  const { data: balanceRaw, isLoading: isContractLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: !!address,
    },
  });

  const balance =
    balanceRaw && decimals ? parseFloat(formatUnits(balanceRaw, decimals)) : 0;
   console.log(balance)
  const hasAccess = balance >= requiredAmount;

  const isLoading = isContractLoading && !hasAccess;

  return {
    isConnected,
    hasAccess,
    balance,
    requiredAmount,
    isLoading,
    address,
  };
}

export default useTokenGate;
