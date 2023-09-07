"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "./input";
import { validateUrl } from "../utils";
import { readHeadings, sendText } from "../actions";
import { Button } from "./button";
import { useEventRunDetails } from "@trigger.dev/react";
import ProgressItem from "./progressItem";

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  // TODO: refactor 2 columns of dashboard into 2 components for readability
  const [generateRunId, setGenerateRunId] = useState("");
  const [headingsRunId, setHeadingsRunId] = useState("");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  async function onSubmit(formData: FormData) {
    const res = await sendText(formData);

    setGenerateRunId(res.id);
  }

  useEffect(() => {
    const run = async () => {
      if (validUrl) {
        const res = await readHeadings(validUrl);

        setHeadingsRunId(res.id);
      }
    };

    run();
  }, [validUrl]);

  const { isLoading, data } = useEventRunDetails(generateRunId);
  const { isLoading: headingsLoading, data: headingsData } =
    useEventRunDetails(headingsRunId);

  return (
    <div className="grid grid-cols-2 space-x-12 w-full grow p-12">
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
          <div className="grow w-full space-y-2">
            <h2>Current site:</h2>
            <iframe
              src={validUrl}
              className="h-full w-full rounded-lg border border-midnight-600 border-opacity-60"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-8 pt-24">
        <h2>Headings:</h2>
        <form action={onSubmit} className="space-y-4 w-full pt-32">
          {headingsLoading && <p>Loading headings...</p>}
          {headingsData?.output && (
            <div className="space-y-4 text-center">
              {headingsData?.output?.map?.(
                (
                  { tag, text }: { tag: string; text: string },
                  index: number
                ) => (
                  <div key={index}>
                    {tag === "h1" ? (
                      <h1>{text}</h1>
                    ) : tag === "h2" ? (
                      <h2>{text}</h2>
                    ) : (
                      <h3>{text}</h3>
                    )}
                  </div>
                )
              )}
            </div>
          )}
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
