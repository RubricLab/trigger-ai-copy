/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { cn, validateUrl } from "@/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunStatuses } from "@trigger.dev/react";
import { toast } from "sonner";
import { Slider } from "./Slider";
import { v4 as uuidv4 } from "uuid";

const voices: Array<{ label: string; value: string }> = [
  { label: "🏴‍☠️ Pirate", value: "pirate" },
  { label: "🎭 Shakespeare", value: "shakespeare" },
  { label: "🎤 Rhyming", value: "rhyming" },
  { label: "🧙 Yoda", value: "yoda" },
  { label: "✨ Useful", value: "useful" },
];

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [eventId, setEventId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState("pirate");
  const [progress, setProgress] = useState(0);
  const [_, setActiveToasts] = useState<
    { key: string; toastId: string | number }[]
  >([]);

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const submit = useCallback(async () => {
    if (!validUrl) return;

    setEventId("");
    setLoading(true);
    setSubmitted(true);
    setProgress(0);

    const res = await callTrigger({
      url: validUrl,
      voice,
      id: uuidv4(),
    });

    setEventId(res.id);
  }, [validUrl, voice]);

  const { statuses, fetchStatus, run } = useEventRunStatuses(eventId);

  useEffect(() => {
    if (run?.status === "FAILURE") {
      toast.error(run.output.message || "Something went wrong");
    }
  }, [run]);

  useEffect(() => {
    if (fetchStatus === "success") setLoading(false);
  }, [fetchStatus]);

  useEffect(() => {
    if (statuses?.length == 0) {
      toast.success("Spin up Trigger");
      return;
    }

    statuses?.map((status) => {
      if (status.history.length === 0) {
        const toastId = toast(status.label);

        setActiveToasts((curr) => [...curr, { toastId, key: status.key }]);

        toast.loading(status.label, { id: toastId, duration: 15 * 1000 });
      } else {
        setActiveToasts((curr) => {
          const toastId = curr.find((t) => t.key == status.key)?.toastId;

          toast.success(status.label, {
            id: toastId || undefined,
            duration: 3000,
          });

          toast.dismiss(toastId);

          return [...curr.filter((t) => t.key !== status.key)];
        });
      }
    });
  }, [statuses, setActiveToasts]);

  useEffect(() => {
    if (statuses?.find(({ key }) => key == "remix")?.data) {
      toast.success("Check out your new copy!");
      setProgress(1);
    }
  }, [statuses]);

  return (
    <form
      action={submit}
      className="w-full max-w-7xl h-full flex flex-col grow p-12 pt-32 space-y-12"
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
          "w-full grow h-full flex flex-col rounded-lg",
          submitted ? "border-2 border-midnight-800" : "border-dashed-wide"
        )}
      >
        <div
          className={cn(
            "h-10 rounded-t-lg w-full flex items-center justify-between",
            submitted
              ? "border-b-2 border-midnight-800 bg-midnight-800"
              : "border-dashed-wide p-0.5"
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
          <Slider
            leftLabel="Before"
            rightLabel="After"
            value={[progress]}
            disabled={!statuses?.find(({ key }) => key == "remix")?.data}
            className={cn("w-64 mr-4", { "opacity-0": !submitted })}
            onValueChange={(value) => setProgress(value[0] || 0)}
          />
          <div />
        </div>
        <div className="relative grow p-0.5 pt-0 max-h-full overflow-y-scroll">
          {!statuses?.find(({ key }) => key == "screenshot")?.data
            ?.url ? null : (
            <>
              <img
                src={
                  statuses?.find(({ key }) => key == "remix")?.data
                    ?.url as string
                }
                className="transition-opacity absolute rounded-b-md"
                style={{ opacity: progress }}
                alt="New website screenshot"
              />
              <img
                src={
                  statuses?.find(({ key }) => key == "screenshot")?.data
                    ?.url as string
                }
                className="transition-opacity absolute rounded-b-md"
                style={{ opacity: 1 - progress }}
                alt="Website screenshot"
              />
            </>
          )}
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
