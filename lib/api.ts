import type { OptimizationEvent } from "./types";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function optimizeFunction(
  code: string,
  onEvent: (event: OptimizationEvent) => void
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 500000);
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const response = await fetch("/api/improve/stream?code=" + encodeURIComponent(code), {
      headers: {
        "Accept": "text/event-stream",
        "X-Playground-Token": "bebra",
      },
      method: "GET",
      signal: controller.signal,
    });

    if (!response.body) {
      throw new Error("No response body for SSE");
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim());
          let data = evt.data;

          if (evt.event_type === "result") {
            data = {
              generated_code: evt.data.improved_function,
              performance_improvement: evt.data.ratio,
            };
          }

          onEvent({ type: evt.event_type, data });
        } catch {
          // ignore bad JSON
        }
      }
    }
  } catch (error: any) {
    // normalize the message
    const message =
      error.name === "AbortError"
        ? "Optimization timed out after 30 seconds."
        : error.message || String(error);

    // emit the error event
    onEvent({ type: "error", data: { message } });
  } finally {
    clearTimeout(timeout);
  }
}
