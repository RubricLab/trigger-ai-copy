"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { validateUrl } from "@/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunStatuses } from "@trigger.dev/react";
import Image from "next/image";

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const submit = async () => {
    setLoading(true);

    if (!validUrl) return;

    const res = await callTrigger(validUrl);

    setEventId(res.id);
  };

  const { statuses, fetchStatus } = useEventRunStatuses(eventId);

  useEffect(() => {
    if (fetchStatus === "success") {
      setLoading(false);
    }
  }, [fetchStatus]);

  return (
    <form action={submit} className="w-full grow p-12 pt-32 space-y-12">
      <div className="flex items-end justify-center gap-4">
        <Input
          label="Your landing page:"
          className={validUrl ? "!ring-green-400/60" : ""}
          placeholder="trigger.dev"
          onChange={setPageUrl}
          clearable
        />
        <Button disabled={!validUrl || loading} type="submit">
          Remix my headings
        </Button>
      </div>
      <div className="w-full flex items-center justify-center">
        <div>
          {statuses?.map((status) => (
            <p key={status.key}>
              ✅ {status.label}: {status.state}
            </p>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 w-full grow">
        <div className="space-y-4 flex flex-col items-end">
          <h2>Current site:</h2>
          {statuses?.find((s) => s.key === "screenshot") ? (
            <Image
              src={
                statuses?.find((s) => s.key === "screenshot")?.data
                  ?.url as string
              }
              height={600}
              width={500}
              alt="Current website screenshot"
            />
          ) : (
            <div className="w-[500px] h-full bg-slate-800 animate-pulse rounded-md" />
          )}
        </div>
        <div className="space-y-4 flex flex-col items-start">
          <h2>Remixed:</h2>
          {statuses?.find((s) => s.key === "screenshot2") ? (
            <Image
              src={
                statuses?.find((s) => s.key === "screenshot2")?.data
                  ?.url as string
              }
              height={600}
              width={500}
              alt="New website screenshot"
            />
          ) : (
            <div className="w-[500px] h-full bg-slate-900 animate-pulse rounded-md" />
          )}
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
