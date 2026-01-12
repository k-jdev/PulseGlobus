import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "navigation";
  children: React.ReactNode;
  className?: string;
}

function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    variant === "navigation"
      ? "flex justify-center items-center transition-all"
      : "px-6 py-3 rounded-full font-semibold text-[16px] transition-all";

  const variantStyles = {
    primary: "bg-[#1452F0] text-white hover:bg-[#0d3cb8]",
    secondary:
      "border border-[#0000001F] bg-[#1452F01A] text-[#1452F0] hover:bg-[#1452F033]",
    navigation:
      "h-[48px] px-6 py-3 gap-2.5 rounded-full border-[0.556px] border-[rgba(0,0,0,0.12)] bg-white hover:bg-gray-50",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
