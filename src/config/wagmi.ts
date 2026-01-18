import { http, createConfig } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";

// Get a project ID at https://cloud.walletconnect.com
// You MUST replace this with your own project ID from WalletConnect Cloud
const projectId = "6a7837ef8f40420a04bb9623be16f62f";

const metadata = {
  name: "PulseGlobus",
  description: "PulseGlobus - Prediction Markets Visualization",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://pulseglobus.com",
  icons: ["https://pulseglobus.com/pulse.svg"],
};

export const config = createConfig({
  chains: [mainnet, polygon],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata,
      showQrModal: false, // Web3Modal will handle the modal
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#1452F0",
    "--w3m-z-index": 1000,
  },
});
