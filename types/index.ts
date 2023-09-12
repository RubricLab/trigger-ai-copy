export type Heading = {
  tag: string;
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
