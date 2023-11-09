import { voices } from "@/app/constants";

export type Heading = {
  id: number;
  text: string;
};

export type TaskStatus =
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

export type Voice = keyof typeof voices;

export type Toast = {
  key: string;
  toastId: string | number;
};
