"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { cn, validateUrl } from "@/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunStatuses } from "@trigger.dev/react";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "./Switch";

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
  const [after, setAfter] = useState(false);

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const submit = async () => {
    setEventId("");
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
      toast.success("Spin up Trigger");
      return;
    }

    statuses?.map((status) => {
      if (!status.history?.length) {
        toast.promise(
          new Promise((resolve) => {
            setTimeout(resolve, 5000);
          }),
          {
            success: status.label,
            error: status.label,
            loading: status.label,
          }
        );
      } else {
        toast.success(status.label);
      }
    });
  }, [statuses]);

  return (
    <form
      action={submit}
      className="w-full grow p-12 pt-32 space-y-12 max-w-7xl"
    >
      <div className="flex items-end justify-between flex-wrap w-full gap-4">
        <Input
          label="Your landing page:"
          className={cn({ "!ring-green-400/60": validUrl })}
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
      </div>
      <div
        className={cn(
          "w-full rounded-lg",
          submitted ? "border-2 border-midnight-800" : "border-dashed-wide"
        )}
      >
        <div
          className={cn(
            "h-10 rounded-t-lg w-full flex items-center justify-between",
            submitted
              ? "border-b-2 border-midnight-800 bg-midnight-800"
              : "border-dashed-wide m-0.5"
          )}
        >
          <div className="flex items-center gap-1.5 pl-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5 rounded-full",
                    submitted ? "bg-midnight-700" : "border-dashed-wide"
                  )}
                />
              ))}
          </div>
          <Switch
            className={submitted ? "visible" : "invisible"}
            title="Before/after"
            checked={after}
            onCheckedChange={() => setAfter(!after)}
          />
          <div />
        </div>
        <div className="flex flex-col space-y-2 items-start relative w-full h-screen p-0.5 pt-0">
          {after ? (
            <Image
              src={
                statuses?.find(({ key }) => key === "remix")?.data
                  ?.url as string
              }
              fill
              alt="New website screenshot"
            />
          ) : (
            <Image
              src={
                statuses?.find(({ key }) => key === "screenshot")?.data
                  ?.url as string
              }
              fill
              alt="Website screenshot"
            />
          )}
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
