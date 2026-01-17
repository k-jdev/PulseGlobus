import { http, createConfig } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";

// Get a project ID at https://cloud.walletconnect.com
const projectId = "b5c3ce6d1a4b1c3e9e7f5a2d8c4e6b0a";

export const config = createConfig({
  chains: [mainnet, polygon],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
});
