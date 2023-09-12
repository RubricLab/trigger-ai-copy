import React from "react";
import ProgressItem from "./ProgressItem";

type Props = {
  run?: {
    tasks: {
      id: string;
      name: string;
      status: string;
      displayKey: string | null;
      icon: string | null;
    }[];
    output?: {
      message: string;
      [key: string]: any;
    };
    status:
      | "PENDING"
      | "CANCELED"
      | "SUCCESS"
      | "QUEUED"
      | "WAITING_ON_CONNECTIONS"
      | "PREPROCESSING"
      | "STARTED"
      | "FAILURE"
      | "TIMED_OUT"
      | "ABORTED";
  };
};

const ProgressSummary = ({ run }: Props) => {
  if (!run) return <></>;

  return (
    <div className="space-y-3">
      {run.tasks && (
        <ProgressItem
          state={!run.tasks?.length ? "progress" : "completed"}
          name="Starting up"
        />
      )}
      {run.tasks
        .filter((task) => task.name !== "log")
        .map((task) => (
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
      {run.output && run.status === "SUCCESS" && (
        <ProgressItem state="completed" name={run.output.message} />
      )}
    </div>
  );
};

export default ProgressSummary;
