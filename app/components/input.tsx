"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import React, { useEffect, useId, useState } from "react";

type Props = {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  clearable?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

function Input({
  label,
  type = "text",
  required = false,
  placeholder,
  clearable = false,
  onChange,
  className,
}: Props) {
  const [value, setValue] = useState("");
  const inputId = useId();

  useEffect(() => {
    onChange?.(value);
  }, [value]);

  return (
    <div className="space-y-1 w-full max-w-xs">
      <label className="font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          id={inputId}
          type={type}
          required={required}
          placeholder={placeholder}
          className={`${className} p-2 pr-8 rounded-md border border-midnight-700 bg-midnight-850 hover:bg-midnight-800 focus:outline-none focus:ring-4 ring-indigo-500/80 focus:border-opacity-0 w-full transition-colors`}
        />
        {clearable && (
          <button
            className={`p-2 absolute right-0 inset-y-0 hover:text-red-400 transition-opacity focus:outline-none ${
              value ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setValue("")}
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Input;
