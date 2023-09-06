"use client";

import React, { useMemo, useState } from "react";
import Input from "./input";
import { validateUrl } from "../utils";
import { sendText } from "../actions";
import { Button } from "./button";
import { useEventRunDetails } from "@trigger.dev/react";
import ProgressItem from "./progressItem";

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [runId, setRunId] = useState("");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  async function onSubmit(formData: FormData) {
    const res = await sendText(formData);

    setRunId(res.id);
    setMessage("complete");
  }

  const { isLoading, data, error } = useEventRunDetails(runId);

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
        <form action={onSubmit} className="space-y-4 w-full">
          <Input
            label="Heading 1"
            placeholder="Develop. Preview. Deploy."
            name="heading1"
          />
          <Button disabled={isLoading}>
            {isLoading ? "Loading..." : "Generate"}
          </Button>
        </form>
        <div className="space-y-3">
          <ProgressItem
            state={!data?.tasks?.length ? "progress" : "completed"}
            name="Starting up"
          />
          {data?.tasks?.map((task) => (
            <ProgressItem
              key={task.id}
              state={
                task.status === "COMPLETED"
                  ? "completed"
                  : task.status === "ERRORED"
                  ? "failed"
                  : "progress"
              }
              name={task.displayKey ?? task.name ?? ""}
              icon={task.icon}
            />
          ))}
          {data?.output && data.status === "SUCCESS" && (
            <ProgressItem
              state="completed"
              name={data.output.message.content}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
