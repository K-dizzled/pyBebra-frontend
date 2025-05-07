export interface OptimizationEvent {
  type: string
  data: any
}

export interface OptimizationRun {
  id: string
  originalCode: string
  events: OptimizationEvent[]
  optimizedCode: string | null
  status: "running" | "success" | "failed"
  timestamp: Date
}
