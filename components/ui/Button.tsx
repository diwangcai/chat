import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "ghost" 
};

export default function Button({ 
  className = "", 
  variant = "primary", 
  ...rest 
}: Props) {
  const base = "px-4 py-2 rounded-[12px] font-medium transition will-change-transform focus-visible:outline-none active:scale-[0.98]";
  const styles = variant === "primary"
    ? "bg-brand text-white hover:opacity-90"
    : "bg-surface text-text border border-gray-200 hover:bg-gray-50";
  
  return (
    <button 
      className={`${base} ${styles} ${className}`} 
      {...rest} 
    />
  );
}
