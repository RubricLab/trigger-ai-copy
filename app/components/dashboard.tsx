"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    const headings = formData.getAll("heading").map((h) => h.toString());

    const res = await generateHeadings(headings);

    setGenerateRunId(res.id);
  };

  const fetchHeadings = useCallback(async () => {
    setLoading(true);
    if (validUrl) {
      const res = await readHeadings(validUrl);

      setHeadingsRunId(res.id);
    }
  }, [validUrl]);

  const { data: headingsRun } = useEventRunDetails(headingsRunId);
  const { data: generateRun } = useEventRunDetails(generateRunId);

  useEffect(() => {
    if (headingsRun?.status == "SUCCESS") {
      setLoading(false);
    }
  }, [headingsRun]);

  useEffect(() => {
    if (generateRun?.status == "SUCCESS") {
      setLoading(false);
    }
  }, [generateRun]);

  return (
    <form action={onSubmit} className="w-full grow p-12 space-y-12">
      <div className="flex justify-center">
        <Input
          label="Your landing page:"
          className={validUrl ? "!ring-green-400/60" : ""}
          placeholder="trigger.dev"
          onChange={setPageUrl}
          clearable
        />
      </div>
      <div className="grid grid-cols-2 space-x-12">
        <div className="space-y-4 flex flex-col items-end">
          <Button disabled={!validUrl || loading} onClick={fetchHeadings}>
            Get headings
          </Button>
          <ProgressSummary run={headingsRun} />
        </div>
        <div className="space-y-4">
          <Button disabled={!headingsRun || loading} type="submit">
            Generate new headings
          </Button>
          <ProgressSummary run={generateRun} />
        </div>
      </div>
      <div className="grid grid-cols-2 space-x-12 w-full grow">
        <div className="space-y-4 flex flex-col items-end">
          <h2>Headings:</h2>
          {headingsRun?.output?.headings?.map?.(
            (heading: Heading, index: number) => (
              <Input
                key={index}
                name="heading"
                initialValue={heading.text}
                clearable
              />
            )
          )}
        </div>
        <div className="space-y-4">
          <h2>AI headings:</h2>
          {generateRun?.output?.headings
            ?.split("\n")
            .map((heading: string, index: number) => (
              <Input key={index} initialValue={heading} disabled />
            ))}
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
