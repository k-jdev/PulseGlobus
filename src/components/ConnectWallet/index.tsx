import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import userIcon from "../../assets/svgs/navbar/user.svg";
import plusIcon from "../../assets/svgs/navbar/plus.svg";

const useWeb3ModalMobileFix = () => {
  useEffect(() => {
    const injectStyles = () => {
      const modal = document.querySelector("w3m-modal");
      if (modal?.shadowRoot) {
        const existingStyle = modal.shadowRoot.querySelector("#w3m-mobile-fix");
        if (!existingStyle) {
          const style = document.createElement("style");
          style.id = "w3m-mobile-fix";
          style.textContent = `
            @media (max-width: 768px) {
              :host {
                --w3m-modal-width: 92vw !important;
              }
              wui-card {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                bottom: auto !important;
                transform: translate(-50%, -50%) !important;
                max-height: 70vh !important;
                max-width: 92vw !important;
                margin: 0 !important;
                border-radius: 24px !important;
              }
            }
          `;
          modal.shadowRoot.appendChild(style);
        }
      }
    };

    injectStyles();

    const observer = new MutationObserver(() => {
      injectStyles();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
};

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

  // Apply mobile centering fix for Web3Modal
  useWeb3ModalMobileFix();

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const baseClasses =
    "px-5 py-3 rounded-full font-semibold text-[16px] flex items-center gap-3 cursor-pointer";

  const defaultClasses =
    "bg-[#1452F0] text-white hover:bg-[#0d3cb8] justify-between";

  const hasCustomBg = className?.includes("bg-");
  const buttonClasses = `${baseClasses} ${hasCustomBg ? "" : defaultClasses} ${
    className || ""
  }`;

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
