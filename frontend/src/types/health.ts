export interface HealthResponse {
  status: "ok";
  service: string;
}

export type HealthSnapshot =
  | { status: "loading" }
  | { status: "connected"; health: HealthResponse }
  | { status: "disconnected"; message: string };
