import { NextRequest, NextResponse } from "next/server";

const backendUrl = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8888"
).replace(/\/+$/, "");

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const normalizedPath = Array.isArray(path) ? path.join("/") : "";

  if (!normalizedPath) {
    return new NextResponse("Missing image path", { status: 400 });
  }

  const legacyPath = `/image/${normalizedPath}`;
  const targetUrl = `${backendUrl}/api/files/legacy-preview?path=${encodeURIComponent(legacyPath)}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      // If fetching fails, return the status from the backend
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // We stream the response body directly
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Content-Length": contentLength || "",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error fetching image from backend", {
      status: 500,
    });
  }
}
