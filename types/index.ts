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
