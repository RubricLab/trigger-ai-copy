import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import React from "react";
import { Spinner } from "./Spinner";
import { CompanyIcon } from "@trigger.dev/companyicons";

type ProgressItemProps = {
  name: string;
  state: "progress" | "completed" | "failed";
  icon?: string | null;
};

function ProgressItem({ icon, state, name }: ProgressItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0">
        {state === "progress" ? (
          <Spinner className="w-6 h-6" />
        ) : state === "completed" ? (
          <CheckCircledIcon className="w-6 h-6 text-emerald-600" />
        ) : (
          <CrossCircledIcon className="w-6 h-6 text-red-600" />
        )}
      </div>
      <div className="flex gap-2 items-center">
        <h4 className="text-base">{name}</h4>
        {icon && icon !== "log" && (
          <CompanyIcon name={icon} className="w-5 h-5 invert" />
        )}
      </div>
    </div>
  );
}

export default ProgressItem;
