import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "./Button";
import Link from "next/link";
import React from "react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-screen h-14 border-t border-midnight-800 bg-midnight-900">
      <div className="flex items-center justify-between h-full px-4 text-midnight-450 text-sm">
        <div className="flex gap-2">
          <span className="text-primary font-semibold">How does it work?</span>{" "}
          <div className="text-sm">
            This site is powered by{" "}
            <Link href="https://trigger.dev" target="_blank">
              Trigger.dev
            </Link>{" "}
            , an open source background jobs framework.
          </div>
        </div>
        <Link
          href="https://github.com/triggerdotdev/autochangelog"
          target="_blank"
        >
          <Button variant="ghost" className="space-x-1">
            <span>Explore the code</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </footer>
  );
};
