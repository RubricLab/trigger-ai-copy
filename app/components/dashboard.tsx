"use client";

import React, { useMemo, useState } from "react";
import Input from "./input";
import { validateUrl } from "../utils";

function dashboard() {
  const [pageUrl, setPageUrl] = useState("");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  return (
    <div className="grid grid-cols-2 w-full grow p-12">
      <div className="flex flex-col items-start gap-8">
        <Input
          label="Your landing page:"
          className={validUrl ? "!ring-green-400/60" : ""}
          placeholder="trigger.dev"
          onChange={(val) => setPageUrl(val)}
          type="url"
          required
          clearable
        />
        {validUrl && (
          <iframe
            src={validUrl}
            className="h-full w-full rounded-lg border border-gray-600/60"
          />
        )}
      </div>
    </div>
  );
}

export default dashboard;
