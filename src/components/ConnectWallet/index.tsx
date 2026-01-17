import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import userIcon from "../../assets/svgs/navbar/user.svg";

interface ConnectWalletProps {
  className?: string;
  isMobile?: boolean;
}

const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const ConnectWallet = ({ className, isMobile }: ConnectWalletProps) => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const buttonClasses = `px-6 py-4 rounded-full font-semibold text-[16px] bg-[#1452F0] text-white hover:bg-[#0d3cb8] flex justify-between items-center gap-5 cursor-pointer ${
    className || ""
  }`;

  if (isConnected && address) {
    return (
      <button
        type="button"
        className={buttonClasses}
        onClick={handleDisconnect}
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
