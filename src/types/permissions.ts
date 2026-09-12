export type PermissionStatus =
  | "granted"
  | "denied"
  | "blocked"
  | "undetermined";

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export interface LocationPermissionResult extends PermissionResult {
  accuracy?: "full" | "reduced";
}