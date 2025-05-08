import axios from "axios";
import type { OptimizationEvent } from "./types"

// Mock function to simulate server-sent events
export async function optimizeFunction(code: string, onEvent: (event: OptimizationEvent) => void): Promise<void> {
  try {
    const response = await axios.post(
      "http://localhost:8089/improve",
      { payload: { code } },
      {
        headers: {
          "X-Playground-Token": "bebra",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    onEvent({
      type: "optimization_success",
      data: {
        generated_code: response.data.improved,
        performance_improvement: "N/A",
      },
    });
  } catch (error) {
    onEvent({
      type: "error",
      data: { message: "An error occurred during optimization" },
    });
  }
}
