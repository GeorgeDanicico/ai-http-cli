export type StatusState = "pending" | "info" | "error" | "success";

export type StatusMessage = {
  text: string;
  state: StatusState;
};
