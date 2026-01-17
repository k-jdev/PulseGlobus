import { http, createConfig } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

// Get a project ID at https://cloud.walletconnect.com
const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";

const metadata = {
  name: "PulseGlobus",
  description: "PulseGlobus - Global Market Insights",
  url: "https://pulseglobus.com",
  icons: ["https://pulseglobus.com/icon.png"],
};

export const config = createConfig({
  chains: [mainnet, polygon],
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
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
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#1452F0",
  },
});
