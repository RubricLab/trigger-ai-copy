/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { cn, copyToClipboard, validateUrl } from "@/app/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunStatuses } from "@trigger.dev/react";
import { Slider } from "./Slider";
import { v4 as uuid } from "uuid";
import { Message, Voice } from "@/app/types";
import { voices } from "@/app/constants";
import {
  CheckIcon,
  Cross1Icon,
  Link2Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Props = {
  url?: string;
  voice?: Voice;
};

function Dashboard({ url, voice }: Props) {
  const router = useRouter();

  const [pageUrl, setPageUrl] = useState(url || "");
  const [eventId, setEventId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voice || "pirate");
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);

  const { statuses, run } = useEventRunStatuses(eventId);

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const screenshotUrl = useMemo<string>(
    () => statuses?.find(({ key }) => key == "screenshot")?.data?.url as string,
    [statuses]
  );

  // Allow screenshot URL to be passed from search params
  const remixedUrl = useMemo<string>(() => {
    if (url) {
      const parsedUrl = validateUrl(url);
      if (parsedUrl) {
        const siteName = new URL(parsedUrl)
          .toString()
          .replace(/https:\/\//g, "")
          .replace(/\.|\//g, "");
        const fileName = `${siteName}-${
          voice ? voices[voice].value : "index"
        }.jpeg`;
        const fileUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${fileName}`;

        setProgress(1);

        return fileUrl;
      }
    }

    return statuses?.find(({ key }) => key == "remix")?.data?.url as string;
  }, [statuses, voice, url]);

  const submit = useCallback(async () => {
    if (!validUrl) return;

    setMessages((curr) => [
      ...curr,
      { body: "Reaching Trigger.dev", status: "info", id: "init" },
    ]);

    // Reset state
    const url = new URL(window.location.href);
    url.searchParams.delete("url");
    url.searchParams.delete("voice");
    router.replace(url.toString());

    setEventId("");
    setLoading(true);
    setSubmitted(true);
    setProgress(0);

    const res = await callTrigger({
      url: validUrl,
      voice: voices[selectedVoice].value,
      id: uuid(),
    });

    setEventId(res.id);
  }, [validUrl, selectedVoice, router]);

  useEffect(() => {
    if (run?.status === "FAILURE") {
      setMessages((curr) => {
        return [
          ...curr,
          {
            body: run.output.message || "Something went wrong",
            status: "error",
            id: run.id,
          },
        ];
      });
      setLoading(false);
    } else if (run?.status === "SUCCESS") {
      setMessages([]);
      toast.success("Check out your new copy!");
      setProgress(1);
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    if (statuses?.length == 0) {
      setMessages((curr) => [...curr.filter(({ id }) => id != "init")]);
    }

    statuses?.map((status) => {
      if (status.history.length === 0) {
        setMessages((curr) => [
          ...curr,
          { body: status.label, status: "info", id: status.key },
        ]);
      } else {
        setMessages((curr) => [
          ...curr.filter((message) => message.id !== status.key),
          { body: status.label, status: "success", id: status.key },
        ]);
      }
    });
  }, [statuses]);

  const copyLink = useCallback(() => {
    copyToClipboard(`${window.location.origin}/${pageUrl}/${selectedVoice}`);

    toast.success("Copied to clipboard");
  }, [pageUrl, selectedVoice]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="w-full max-w-7xl h-full flex flex-col grow p-12 pt-32 space-y-12"
    >
      <div className="flex items-end justify-between flex-wrap w-full gap-4">
        <Input
          label="Your landing page:"
          className={cn({ "!ring-green-400/60": validUrl })}
          placeholder="Enter a URL"
          onChange={setPageUrl}
          initialValue={pageUrl}
          clearable
        />
        <div className="flex flex-col justify-end space-y-0.5">
          <div className="text-dimmed text-sm">
            What type of copy do you want?
          </div>
          <div className="flex items-end relative divide-midnight-650 divide-x">
            {Object.entries(voices).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedVoice(key as Voice)}
                className={cn(
                  "whitespace-nowrap text-dimmed text-sm h-10 px-4 first:rounded-l-md last:rounded-r-md",
                  key == selectedVoice
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
          "w-full grow h-full relative flex flex-col rounded-lg",
          submitted ? "border-2 border-midnight-800" : "border-dashed-wide"
        )}
      >
        {messages.length > 0 ? (
          <div className="absolute border-midnight-800/80 border z-50 flex items-start gap-3 p-6 flex-col justify-start shadow-xl top-[25%] left-[50%] translate-x-[-50%] h-56 w-96 bg-midnight-950/90 rounded-lg">
            {messages.map(({ body, status, id }) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "flex items-center gap-2",
                  status == "error"
                    ? "text-red-500"
                    : status == "success"
                    ? "text-green-500"
                    : "text-dimmed"
                )}
              >
                {status == "error" ? (
                  <Cross1Icon className="w-5 h-5" />
                ) : status == "success" ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <ReloadIcon className="w-5 h-5 animate-spin" />
                )}
                <span>{body}</span>
              </motion.div>
            ))}
          </div>
        ) : null}
        <div
          className={cn(
            "h-10 rounded-t-lg w-full flex items-center justify-between px-4",
            submitted
              ? "border-b-2 border-midnight-800 bg-midnight-800"
              : "border-dashed-wide py-0.5"
          )}
        >
          <div className="flex items-center gap-1.5">
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
            disabled={!remixedUrl}
            className={cn("w-64 mr-4", { "opacity-0": !submitted })}
            onValueChange={(value) => setProgress(value[0] || 0)}
          />
          <div />
        </div>
        <div className="relative grow rounded-b-xl max-h-full mb-0.5 overflow-x-hidden overflow-y-scroll">
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              className="transition-opacity absolute px-0.5"
              style={{ opacity: 1 - progress }}
              alt="Website screenshot"
            />
          ) : null}
          {remixedUrl ? (
            <img
              src={remixedUrl}
              className="transition-opacity absolute px-0.5"
              style={{ opacity: progress }}
              alt="New website screenshot"
            />
          ) : null}
        </div>
        {remixedUrl ? (
          <Button
            size="sm"
            className="absolute top-12 right-2"
            variant="secondary"
            disabled={!remixedUrl}
            onClick={copyLink}
            type="button"
          >
            <span>Share</span>
            <Link2Icon className="w-5 h-5 ml-2" />
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export default Dashboard;
