import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

// Resolve first existing candidate path for the worker file to handle dev, prod, and standalone environments
const candidates = [
  path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"),
  path.join(process.cwd(), ".next/standalone/node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"),
  path.join(process.cwd(), "../node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"),
];



let workerPath = candidates[0]; // fallback
for (const c of candidates) {
  if (fs.existsSync(c)) {
    workerPath = c;
    break;
  }
}

PDFParse.setWorker(pathToFileURL(workerPath).href);

export async function POST(request) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text || "";

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from PDF. Please make sure the PDF contains selectable text or copy-paste it directly." }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("PDF Parsing error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse PDF resume" }, { status: 500 });
  }
}
export const maxDuration = 60;
