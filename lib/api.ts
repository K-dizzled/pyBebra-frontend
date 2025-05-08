import type { OptimizationEvent } from "./types";

const EVENT_TYPE_MAP: Record<string, string> = {
  fuzz_wrapper_generated: "fuzz_wrapper_generated",
  fuzzing_started: "fuzzing_started",
  fuzzing_finished: "fuzzing_finished",
  sample_input_generated: "sample_input_generated",
  rag_retrieved: "rag_retrieved",
  function_generated: "function_generated",
  generated_function_rejected: "generated_function_rejected",
  result: "optimization_success", // or a new type if you want
  error: "error",
};

export async function optimizeFunction(
  code: string,
  onEvent: (event: OptimizationEvent) => void
): Promise<void> {
  // Build the SSE URL (GET with query param, or POST to get a token and then connect, depending on your backend)
  // Here, let's assume you POST to /improve, get a token or id, then connect to /improve/stream?id=...
  // But if your backend supports POST body with SSE, you need a custom fetch.

  // We'll use fetch with ReadableStream for POST+SSE (modern browsers only)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("http://localhost:8089/improve/stream", {
      method: "POST",
      headers: {
        "X-Playground-Token": "bebra",
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ payload: { code } }),
      signal: controller.signal,
    });

    if (!response.body) throw new Error("No response body for SSE");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data:")) {
          try {
            const evt = JSON.parse(line.slice(5).trim());
            const mappedType = EVENT_TYPE_MAP[evt.event_type] || evt.event_type;
            let data = evt.data;
            if (evt.event_type === "result") {
              data = {
                generated_code: evt.data.improved_function,
                performance_improvement: evt.data.ratio,
              };
            }
            onEvent({ type: mappedType, data });
          } catch (e) {
            // Ignore parse errors for now
          }
        }
      }
    }
  } catch (error: any) {
    let message = "An error occurred during optimization";
    if (error.name === "AbortError") {
      message = "Optimization timed out after 30 seconds.";
    } else if (error.message) {
      message = error.message;
    }
    onEvent({
      type: "error",
      data: { message },
    });
  } finally {
    clearTimeout(timeout);
  }
}
