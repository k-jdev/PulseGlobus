import { useAccount, useConnect, useDisconnect } from "wagmi";
import userIcon from "../../assets/svgs/navbar/user.svg";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

interface ConnectWalletProps {
  className?: string;
  isMobile?: boolean;
}

const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const ConnectWallet = ({ className, isMobile }: ConnectWalletProps) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    console.log("Connect clicked, connectors:", connectors);

    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    // Find MetaMask connector specifically
    const metaMaskConnector = connectors.find((c) => c.id === "io.metamask");

    if (metaMaskConnector) {
      console.log("Using MetaMask connector:", metaMaskConnector);
      connect({ connector: metaMaskConnector });
    } else if (connectors.length > 0) {
      // Fallback to first available connector
      console.log("Using fallback connector:", connectors[0]);
      connect({ connector: connectors[0] });
    }
  };

  const buttonClasses = `px-6 py-4 rounded-full font-semibold text-[16px] bg-[#1452F0] text-white hover:bg-[#0d3cb8] flex justify-between items-center gap-5 cursor-pointer ${
    className || ""
  }`;

  if (isConnected && address) {
    return (
      <button
        type="button"
        className={buttonClasses}
        onClick={() => disconnect()}
      >
        <span>{formatAddress(address)}</span>
        <img src={userIcon} alt="User Icon" />
      </button>
    );
  }

  return (
    <button type="button" className={buttonClasses} onClick={handleConnect}>
      <span>{isMobile ? "Connect" : "Connect Wallet"}</span>
      <img src={userIcon} alt="User Icon" />
    </button>
  );
};

export default ConnectWallet;
