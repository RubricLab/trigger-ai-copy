"use client";

import React, { useMemo, useState } from "react";
import Input from "./Input";
import { validateUrl } from "@/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunDetails } from "@trigger.dev/react";
import Image from "next/image";
import ProgressSummary from "./ProgressSummary";

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [eventId, setEventId] = useState("");
  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const submit = async () => {
    if (!validUrl) return;

    const res = await callTrigger(validUrl);

    setEventId(res.id);
  };

  const { data } = useEventRunDetails(eventId);

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
        <Button disabled={!validUrl} type="submit">
          Remix my headings
        </Button>
        <ProgressSummary run={data} />
      </div>
      <div className="grid grid-cols-2 space-x-12 w-full grow">
        <div className="space-y-4 flex flex-col items-end">
          <h2>Current site:</h2>
          {data?.output?.screenshot ? (
            <Image
              src={data?.output?.screenshot}
              height={600}
              width={500}
              alt="Current website screenshot"
            />
          ) : (
            <div className="w-[500px] h-full bg-blue-900 animate-pulse rounded-md"></div>
          )}
        </div>
        <div className="space-y-4">
          <h2>Remixed:</h2>
          <Image
            src="https://picsum.photos/seed/1695841054849/500/600"
            height={600}
            width={500}
            alt="New website"
          />
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
