// This file contains the code where the frontend interacts with the backend.

export async function fetch_summary_stream(id: { id: number }): Promise<ReadableStream<string>> {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id),
    });
    if (!response.body) {
      throw new Error(`Response has no body. Status: ${response.status}`);
    }
    return response.body.pipeThrough(new TextDecoderStream());
  }