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
  const { isConnected, hasAccess, isLoading, balance } = useTokenGate({
    tokenAddress,
    requiredAmount,
  });
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const hasInsufficientBalance = isConnected && !isLoading && !hasAccess;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  const showOverlay = !isConnected || isLoading || !hasAccess;

  const renderOverlay = () => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
        <div className="bg-white flex flex-col gap-3 sm:gap-4 items-start overflow-hidden rounded-[14px] shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] w-full max-w-[95vw] sm:max-w-[480px] md:max-w-[520px] select-none">
          {/* Header Image */}
          <div className="relative w-full aspect-[2100/793]">
            <img
              alt="PulseGlobus"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={modalHeader}
              draggable="false"
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

            {hasInsufficientBalance && (
              <div className="flex items-center gap-3 w-full bg-[#1452f0]/10 border border-[#1452f0]/20 rounded-xl px-4 py-3">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 11C11.7348 11 11.4804 11.1054 11.2929 11.2929C11.1054 11.4804 11 11.7348 11 12V16C11 16.2652 11.1054 16.5196 11.2929 16.7071C11.4804 16.8946 11.7348 17 12 17C12.2652 17 12.5196 16.8946 12.7071 16.7071C12.8946 16.5196 13 16.2652 13 16V12C13 11.7348 12.8946 11.4804 12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11ZM12.38 7.08C12.1365 6.97998 11.8635 6.97998 11.62 7.08C11.4973 7.12759 11.3851 7.19896 11.29 7.29C11.2017 7.3872 11.1306 7.49882 11.08 7.62C11.024 7.73868 10.9966 7.86882 11 8C10.9992 8.13161 11.0245 8.26207 11.0742 8.38391C11.124 8.50574 11.1973 8.61656 11.29 8.71C11.3872 8.79833 11.4988 8.86936 11.62 8.92C11.7715 8.98224 11.936 9.00632 12.099 8.99011C12.2619 8.97391 12.4184 8.91792 12.5547 8.82707C12.691 8.73622 12.8029 8.61328 12.8805 8.46907C12.9582 8.32486 12.9992 8.16378 13 8C12.9963 7.73523 12.8927 7.48163 12.71 7.29C12.6149 7.19896 12.5028 7.12759 12.38 7.08ZM12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z"
                      fill="#1452f0"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1452f0] text-[14px] sm:text-[15px]">
                    Insufficient Balance
                  </span>
                  <span className="text-[#1452f0]/70 text-[12px] sm:text-[13px]">
                    You have{" "}
                    <span className="font-bold">
                      {balance.toLocaleString()}
                    </span>{" "}
                    {tokenSymbol}, need{" "}
                    <span className="font-bold">
                      {requiredAmount.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 sm:gap-4 items-stretch w-full flex-col sm:flex-row">
              {/* Connect Wallet Button */}
              <button
                onClick={() => open()}
                disabled={isLoading}
                className="bg-[#1452f0] hover:bg-[#1040d0] transition-colors flex flex-1 items-center justify-between min-h-[48px] sm:min-h-[56px] overflow-hidden px-4 sm:px-6 py-3 sm:py-4 rounded-full w-full disabled:opacity-70"
              >
                <span className="font-semibold text-[14px] sm:text-[16px] text-white tracking-[-0.32px]">
                  {isLoading
                    ? "Checking..."
                    : hasInsufficientBalance
                      ? "Switch Wallet"
                      : "Connect Wallet"}
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
