"use client";

import React, { useCallback, useMemo, useState } from "react";
import Input from "./Input";
import { validateUrl } from "@/utils";
import { readHeadings, generateHeadings } from "../actions";
import { Button } from "./Button";
import { useEventRunDetails } from "@trigger.dev/react";
import { Heading } from "@/types";
import ProgressSummary from "./ProgressSummary";

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
    data: headingsRun,
    isLoading: headingsLoading,
    error: headingsError,
  } = useEventRunDetails(headingsRunId);

  const {
    data: generateRun,
    isLoading: generateRunLoading,
    error: generateRunError,
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
        <ProgressSummary run={headingsRun} />
        {headingsRun?.output && (
          <>
            <h2>Headings:</h2>
            <form action={onSubmit} className="space-y-4 w-full">
              <div className="grow w-full space-y-4">
                <Button disabled={generateRunLoading}>
                  {generateRunLoading ? "Loading..." : "Generate new headings"}
                </Button>
                {headingsRun?.output?.headings?.map?.(
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
        <ProgressSummary run={generateRun} />
        {generateRun?.output && (
          <div className="grow w-full space-y-4">
            <h2>AI headings:</h2>
            {generateRun?.output?.headings
              ?.split("\n")
              .map((heading: string, index: number) => (
                <Input disabled={true} key={index} initialValue={heading} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
