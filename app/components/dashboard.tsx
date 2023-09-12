"use client";

import React, { useCallback, useMemo, useState } from "react";
import Input from "./Input";
import { validateUrl } from "@/utils";
import { readHeadings, generateHeadings } from "../actions";
import { Button } from "./Button";
import { useEventRunDetails } from "@trigger.dev/react";
import ProgressItem from "./ProgressItem";
import { Heading } from "@/types";

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [generateRunId, setGenerateRunId] = useState("");
  const [headingsRunId, setHeadingsRunId] = useState("");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const onSubmit = async (formData: FormData) => {
    const headings = formData.getAll("heading").map((h) => h.toString());

    const res = await generateHeadings(headings);

    setGenerateRunId(res.id);
  };

  const fetchHeadings = useCallback(async () => {
    if (validUrl) {
      const res = await readHeadings(validUrl);

      setHeadingsRunId(res.id);
    }
  }, [validUrl]);

  const {
    data: headings,
    isLoading: headingsLoading,
    error: headingsError,
  } = useEventRunDetails(headingsRunId);

  const {
    data: aiHeadings,
    isLoading: aiHeadingsLoading,
    error: aiHeadingsError,
  } = useEventRunDetails(generateRunId);

  // TODO: componentize two columns (lots in common)
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
        <Button disabled={!validUrl || headingsLoading} onClick={fetchHeadings}>
          Get headings
        </Button>
        <div className="space-y-3">
          <ProgressItem
            name="Starting up"
            state={
              headingsError
                ? "failed"
                : headings?.tasks?.length
                ? "completed"
                : "progress"
            }
          />
          {headings?.tasks?.map((task) => (
            <ProgressItem
              key={task.id}
              state={
                task.status === "COMPLETED"
                  ? "completed"
                  : task.status === "ERRORED"
                  ? "failed"
                  : "progress"
              }
              name={task.displayKey || task.name || ""}
              icon={task.icon}
            />
          ))}
          {headings?.output && (
            <ProgressItem
              state={headings.status === "SUCCESS" ? "completed" : "failed"}
              name={headings.output.message}
            />
          )}
        </div>
        {headings?.output && (
          <>
            <h2>Headings:</h2>
            <form action={onSubmit} className="space-y-4 w-full">
              <div className="grow w-full space-y-4">
                <Button disabled={aiHeadingsLoading}>
                  {aiHeadingsLoading ? "Loading..." : "Generate new headings"}
                </Button>
                {headings?.output?.headings?.map?.(
                  (heading: Heading, index: number) => (
                    <Input
                      key={index}
                      name="heading"
                      initialValue={heading.text}
                    />
                  )
                )}
              </div>
            </form>
          </>
        )}
      </div>
      <div className="flex flex-col items-start gap-8">
        <div className="space-y-3">
          <ProgressItem
            state={!aiHeadings?.tasks?.length ? "progress" : "completed"}
            name="Starting up"
          />
          {aiHeadings?.tasks?.map((task) => (
            <ProgressItem
              key={task.id}
              state={
                task.status === "COMPLETED"
                  ? "completed"
                  : task.status === "ERRORED"
                  ? "failed"
                  : "progress"
              }
              name={task.displayKey || task.name || ""}
              icon={task.icon}
            />
          ))}
          {aiHeadings?.output && aiHeadings.status === "SUCCESS" && (
            <ProgressItem state="completed" name={aiHeadings.output.message} />
          )}
        </div>
        <h2>AI headings:</h2>
        <div className="grow w-full space-y-2">
          {aiHeadings?.output && (
            <div className="space-y-4 text-center">
              {aiHeadings?.output?.headings
                ?.split("\n")
                .map((heading: string, index: number) => (
                  <Input key={index} initialValue={heading} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
