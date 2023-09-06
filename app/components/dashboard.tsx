"use client";

import React, { useMemo, useState } from "react";
import Input from "./input";
import { validateUrl } from "../utils";

function dashboard() {
  const [pageUrl, setPageUrl] = useState("");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  return (
    <div className="grid grid-cols-2 w-full grow border p-12">
      <div className="flex flex-col items-start gap-8">
        <Input
          label="Your landing page:"
          className={validUrl ? "!border-green-600/60 !ring-green-600/60" : ""}
          placeholder="trigger.dev"
          onChange={(val) => setPageUrl(val)}
          type="url"
          required
          clearable
        />
        {validUrl && <iframe src={validUrl} className="h-full w-full" />}
      </div>
    </div>
  );
}

export default dashboard;
