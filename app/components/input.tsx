"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import React, { useId, useState } from "react";

type Props = {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  clearable?: boolean;
};

function Input({
  label,
  type = "text",
  required = false,
  placeholder,
  clearable = false,
}: Props) {
  const [value, setValue] = useState("");
  const inputId = useId();

  return (
    <div className="space-y-1 w-full max-w-xs">
      <label className="text-gray-700 font-semibold" htmlFor={inputId}>
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
          className="p-2 pr-7 rounded-md border border-gray-300 focus:outline-none focus:ring-4 ring-indigo-500/60 focus:border-indigo-500/60 w-full"
        />
        {clearable && (
          <button
            className={`p-2 absolute right-0 inset-y-0 hover:text-red-500 transition-opacity duration-500 ${
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
