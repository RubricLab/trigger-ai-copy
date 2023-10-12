"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { cn, validateUrl } from "@/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunStatuses } from "@trigger.dev/react";
import Image from "next/image";
// import { CheckCircledIcon } from "@radix-ui/react-icons";
// import { Spinner } from "./Spinner";
import toast from "react-hot-toast";

const voices: Array<{ label: string; value: string }> = [
  { label: "✨ Useful", value: "useful" },
  { label: "🎭 Shakespeare", value: "shakespeare" },
  { label: "🎤 Rhyming", value: "rhyming" },
  { label: "🧙 Yoda", value: "yoda" },
  { label: "🏴‍☠️ Pirate", value: "pirate" },
  { label: "✏️ Haiku", value: "haiku" },
];

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [eventId, setEventId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState("useful");

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const submit = async () => {
    setLoading(true);
    setSubmitted(true);

    if (!validUrl) return;

    const res = await callTrigger({ url: validUrl, voice });

    setEventId(res.id);
  };

  const { statuses, fetchStatus } = useEventRunStatuses(eventId);

  useEffect(() => {
    if (fetchStatus === "success") {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    if (!!statuses && !statuses?.length) {
      toast("Starting up");
      return;
    }

    statuses?.map((status) => {
      if (!status.history?.length) toast(status.label);
    });
  }, [statuses]);

  return (
    <form action={submit} className="w-full grow p-12 pt-32 space-y-12">
      <div className="flex items-end justify-start flex-wrap w-full gap-4">
        <Input
          label="Your landing page:"
          className={validUrl ? "!ring-green-400/60" : ""}
          placeholder="trigger.dev"
          onChange={setPageUrl}
          clearable
        />
        <div className="flex flex-col justify-end space-y-0.5">
          <div className="text-midnight-400 text-sm">
            What type of copy do you want?
          </div>
          <div className="flex items-end relative divide-midnight-650 divide-x">
            {voices.map((item) => (
              <button
                key={item.label}
                onClick={() => setVoice(item.value)}
                className={cn(
                  "whitespace-nowrap text-dimmed text-sm h-10 px-4 first:rounded-l-md last:rounded-r-md",
                  voice === item.value
                    ? "bg-midnight-700"
                    : "bg-midnight-800 hover:bg-midnight-750"
                )}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <Button disabled={!validUrl || loading} type="submit">
          Generate
        </Button>
        {/* <div className="w-96 h-28 text-dimmed">
          <div className="flex items-center gap-2">
            {submitted ? (
              <>
                {!statuses?.length ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  <CheckCircledIcon className="w-5 h-5 text-emerald-600" />
                )}
                <div>Starting up</div>
              </>
            ) : null}
          </div>
          {statuses?.map((status) => (
            <div key={status.key} className="flex items-center gap-2">
              {status.state === "loading" ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <CheckCircledIcon className="w-5 h-5 text-emerald-600" />
              )}
              <div>{status.label}</div>
            </div>
          ))}
        </div> */}
      </div>
      <div className="grid grid-cols-2 gap-12 w-full border-dashed-wide p-8 rounded-lg">
        <div className="flex flex-col space-y-2 items-end">
          <h2>Current site:</h2>
          {statuses?.find(({ key }) => key === "screenshot")?.data?.url ? (
            <Image
              src={
                statuses?.find(({ key }) => key === "screenshot")?.data
                  ?.url as string
              }
              width={500}
              height={600}
              className="rounded"
              alt="Current website screenshot"
            />
          ) : (
            <div className="w-[500px] h-[400px] bg-red-900/20 animate-pulse rounded-md" />
          )}
        </div>
        <div className="flex flex-col space-y-2 items-start">
          <h2>Remixed:</h2>
          {statuses?.find(({ key }) => key === "remix")?.data?.url ? (
            <Image
              src={
                statuses?.find(({ key }) => key === "remix")?.data
                  ?.url as string
              }
              width={500}
              height={600}
              className="rounded"
              alt="New website screenshot"
            />
          ) : (
            <div className="w-[500px] h-[400px] bg-green-900/20 animate-pulse rounded-md" />
          )}
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
