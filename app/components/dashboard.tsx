"use client";

import React, { useMemo, useState } from "react";
import Input from "./input";
import { validateUrl } from "../utils";
import { sendText } from "../actions";
import { Button } from "./button";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

function dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [message, setMessage] = useState("");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  async function onSubmit(formData: FormData) {
    const res = await sendText(formData);
    setMessage(res.payload?.message?.content || "?");
  }

  const { pending } = useFormStatus();

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
            className="h-full w-full rounded-lg border border-midnight-600 border-opacity-60"
          />
        )}
      </div>
      <div className="flex flex-col items-start gap-8">
        <form action={onSubmit} className="space-y-4">
          <Input
            label="Heading 1"
            placeholder="Develop. Preview. Deploy."
            name="heading1"
          />
          <Button disabled={pending}>
            {pending ? "Loading..." : "Generate"}
          </Button>
          <div>{message}</div>
        </form>
      </div>
    </div>
  );
}

export default dashboard;
