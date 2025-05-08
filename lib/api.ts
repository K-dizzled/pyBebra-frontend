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
        timeout: 150000,
      }
    );

    onEvent({
      type: "optimization_success",
      data: {
        generated_code: response.data.improved,
        performance_improvement: "N/A",
      },
    });
  } catch (error: any) {
    let message = "An error occurred during optimization";
    if (error.code === 'ECONNABORTED') {
      message = "Optimization timed out after 30 seconds.";
    } else if (error.response) {
      if (error.response.data && typeof error.response.data.detail === 'string') {
        message = `Server error: ${error.response.data.detail}`;
      } else if (typeof error.response.data === 'string') {
        message = `Server error: ${error.response.data}`;
      } else {
        message = `Server error: ${error.response.statusText || 'Unknown error'}`;
      }
    } else if (error.message) {
      message = error.message;
    }
    onEvent({
      type: "error",
      data: { message },
    });
  }
}
