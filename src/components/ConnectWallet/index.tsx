import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import userIcon from "../../assets/svgs/navbar/user.svg";
import plusIcon from "../../assets/svgs/navbar/plus.svg";
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

  // Base classes that are always applied
  const baseClasses =
    "px-6 py-4 rounded-full font-semibold text-[16px] flex items-center gap-5 cursor-pointer";

  // Default classes (can be overridden by className)
  const defaultClasses =
    "bg-[#1452F0] text-white hover:bg-[#0d3cb8] justify-between";

  // If className contains bg- it means custom styling, skip default colors
  const hasCustomBg = className?.includes("bg-");
  const buttonClasses = `${baseClasses} ${hasCustomBg ? "" : defaultClasses} ${
    className || ""
  }`;

  // Icon style - invert for light backgrounds
  const iconStyle = hasCustomBg ? { filter: "invert(1)" } : {};

  if (isConnected && address) {
    return (
      <button
        type="button"
        className={buttonClasses}
        onClick={handleDisconnect}
      >
        <span>{formatAddress(address)}</span>
        <img src={userIcon} alt="User Icon" style={iconStyle} />
      </button>
    );
  }

  return (
    <button type="button" className={buttonClasses} onClick={handleConnect}>
      <span>{isMobile ? "Connect" : "Connect Wallet"}</span>
      <img src={plusIcon} alt="Plus Icon" style={iconStyle} />
    </button>
  );
};

export default ConnectWallet;
