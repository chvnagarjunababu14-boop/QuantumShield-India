export type HealthResponse = {
  status: string;
  service: string;
};

export type HealthSnapshot =
  | { phase: "loading" }
  | { phase: "connected"; health: HealthResponse }
  | { phase: "unavailable"; message: string };
