import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-[18px] border border-gray-200 bg-surface px-4 py-2
      placeholder-subtext focus-visible:outline-none ${props.className || ""}`}
    />
  );
}
