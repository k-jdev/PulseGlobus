import { useEffect } from "react";

import plusIcon from "@/assets/svgs/navbar/plus.svg";
import userIcon from "@/assets/svgs/navbar/user.svg";
import { useWalletConnection } from "@/lib/web3";

const MOBILE_MODAL_STYLES = `
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

/**
 * Web3Modal renders inside a shadow root and offers no mobile sizing options,
 * so the override stylesheet has to be injected into that root. The modal is
 * re-created on demand, hence the MutationObserver rather than a one-off run.
 */
const useWeb3ModalMobileFix = () => {
  useEffect(() => {
    const injectStyles = () => {
      const modal = document.querySelector("w3m-modal");
      const root = modal?.shadowRoot;
      if (!root || root.querySelector("#w3m-mobile-fix")) return;

      const style = document.createElement("style");
      style.id = "w3m-mobile-fix";
      style.textContent = MOBILE_MODAL_STYLES;
      root.appendChild(style);
    };

    injectStyles();

    const observer = new MutationObserver(injectStyles);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
};

interface ConnectWalletProps {
  className?: string;
  isMobile?: boolean;
}

const BASE_CLASSES =
  "px-5 py-3 rounded-full font-semibold text-[16px] flex items-center gap-3 cursor-pointer";
const DEFAULT_CLASSES =
  "bg-[#1452F0] text-white hover:bg-[#0d3cb8] justify-between";

export const ConnectWallet = ({ className, isMobile }: ConnectWalletProps) => {
  const { isConnected, shortAddress, connect, disconnect } =
    useWalletConnection();

  useWeb3ModalMobileFix();

  const hasCustomBackground = className?.includes("bg-");
  const buttonClasses = [
    BASE_CLASSES,
    hasCustomBackground ? "" : DEFAULT_CLASSES,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // The icons are monochrome black, so they need inverting on dark backgrounds.
  const iconStyle = hasCustomBackground ? { filter: "invert(1)" } : undefined;

  if (isConnected && shortAddress) {
    return (
      <button type="button" className={buttonClasses} onClick={disconnect}>
        <span>{shortAddress}</span>
        <img src={userIcon} alt="" style={iconStyle} />
      </button>
    );
  }

  return (
    <button type="button" className={buttonClasses} onClick={connect}>
      <span>{isMobile ? "Connect" : "Connect Wallet"}</span>
      <img src={plusIcon} alt="" style={iconStyle} />
    </button>
  );
};

export default ConnectWallet;
