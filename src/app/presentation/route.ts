import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fileContent = await readFile(path.join(process.cwd(), "presentation.html"), "utf-8");
    return new Response(fileContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response("Presentation file not found", { status: 404 });
  }
}
