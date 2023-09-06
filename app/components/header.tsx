import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import TriggerLogo from "./triggerLogo";

function Header() {
  return (
    <header className="absolute top-0 w-screen h-16 border">
      <div className="flex items-center justify-between h-full px-8">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tighter">
            CopyPrettifier
          </h1>
          <div className="text-xs flex items-center gap-1">
            by
            <TriggerLogo className="h-4" />
          </div>
        </div>
        <Link
          href="https://github.com/rubriclab/trigger-ai-copy"
          target="_blank"
        >
          <GitHubLogoIcon className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
