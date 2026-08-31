import { createWeb3Modal } from "@web3modal/wagmi/react";
import { http, createConfig } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "6a7837ef8f40420a04bb9623be16f62f";

const metadata = {
  name: "PulseGlobus",
  description: "PulseGlobus - Prediction Markets Visualization",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://pulseglobus.com",
  icons: ["https://pulseglobus.com/pulse.svg"],
};

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon],
  connectors: [
    injected(),
    // The Web3Modal UI owns the QR flow, so the connector must not open its own.
    walletConnect({ projectId, metadata, showQrModal: false }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

const FEATURED_WALLET_IDS = [
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
  "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
];

// Web3Modal registers a global custom element, so it must be created exactly
// once per page load — hence the module side effect rather than a hook.
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#1452F0",
    "--w3m-z-index": 1000,
    "--w3m-border-radius-master": "16px",
  },
  featuredWalletIds: FEATURED_WALLET_IDS,
});
