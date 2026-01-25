import { FC, ReactNode, useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useTokenGate } from "../../hooks/useTokenGate";
import modalHeader from "../../assets/images/tokenModal/modal-header.png";

const DEFAULT_TOKEN_ADDRESS =
  "0xF9877901a3D8c8D26078703004E748E66A4009b5" as `0x${string}`;
const DEFAULT_REQUIRED_AMOUNT = 1000;

interface TokenGateProps {
  children: ReactNode;
  tokenAddress?: `0x${string}`;
  requiredAmount?: number;
  tokenSymbol?: string;
}

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-3)}`;
};

export const TokenGate: FC<TokenGateProps> = ({
  children,
  tokenAddress = DEFAULT_TOKEN_ADDRESS,
  requiredAmount = DEFAULT_REQUIRED_AMOUNT,
  tokenSymbol = "$PULSE",
}) => {
  const { open } = useWeb3Modal();
  const { isConnected, hasAccess, isLoading } = useTokenGate({
    tokenAddress,
    requiredAmount,
  });
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  const showOverlay = !isConnected || isLoading || !hasAccess;

  const renderOverlay = () => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
        <div className="bg-white flex flex-col gap-3 sm:gap-4 items-start overflow-hidden rounded-[14px] shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] w-full max-w-[95vw] sm:max-w-[480px] md:max-w-[520px]">
          {/* Header Image */}
          <div className="relative w-full aspect-[2100/793]">
            <img
              alt="PulseGlobus"
              className="absolute inset-0 w-full h-full object-cover"
              src={modalHeader}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 sm:gap-6 items-start pb-4 sm:pb-5 px-4 sm:px-6 w-full">
            {/* Text Container */}
            <div className="flex flex-col gap-1.5 sm:gap-2 items-start w-full">
              <h1 className="font-bold text-[24px] sm:text-[32px] md:text-[42px] text-black tracking-[-0.56px] leading-[1.2] sm:leading-[1.15]">
                <span>Bond </span>
                <span className="text-[#1452f0]">
                  {requiredAmount.toLocaleString()} {tokenSymbol}
                </span>
                <br />
                <span>to unlock the terminal</span>
              </h1>
              <p className="font-medium text-[#808080] text-[13px] sm:text-[14px] md:text-[16px] tracking-[-0.32px] leading-[1.5] sm:leading-[24px]">
                Connect a wallet with the required balance to unlock access, or
                acquire PULSE to continue.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 sm:gap-4 items-stretch w-full flex-col sm:flex-row">
              {/* Connect Wallet Button */}
              <button
                onClick={() => open()}
                disabled={isLoading}
                className="bg-[#1452f0] hover:bg-[#1040d0] transition-colors flex flex-1 items-center justify-between min-h-[48px] sm:min-h-[56px] overflow-hidden px-4 sm:px-6 py-3 sm:py-4 rounded-full w-full disabled:opacity-70"
              >
                <span className="font-semibold text-[14px] sm:text-[16px] text-white tracking-[-0.32px]">
                  {isLoading ? "Checking..." : "Connect Wallet"}
                </span>
                {isLoading ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"
                      fill="white"
                    />
                  </svg>
                )}
              </button>

              {/* Token Address Button */}
              <button
                onClick={() => copyToClipboard(DEFAULT_TOKEN_ADDRESS)}
                className="bg-[rgba(20,82,240,0.1)] border border-black/12 hover:bg-[rgba(20,82,240,0.15)] transition-colors flex flex-1 min-h-[48px] sm:h-[56px] items-center justify-between overflow-hidden px-4 sm:px-6 py-3 rounded-full w-full"
              >
                <span className="font-semibold text-[#1452f0] text-[14px] sm:text-[16px] tracking-[-0.32px]">
                  {shortenAddress(DEFAULT_TOKEN_ADDRESS)}
                </span>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z"
                    stroke="#1452f0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V9C4 8.46957 4.21071 7.96086 4.58579 7.58579C4.96086 7.21071 5.46957 7 6 7H8"
                    stroke="#1452f0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={showOverlay ? "pointer-events-none" : ""}>{children}</div>

      {showOverlay && renderOverlay()}

      {/* Copied Toast */}
      {showCopiedToast && (
        <div className="fixed z-[200] bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 bg-black/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-400"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied!
        </div>
      )}
    </>
  );
};

export default TokenGate;
