import { GeminiNLPAdapter } from "./src/services/adapters/gemini-nlp-adapter";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
  const adapter = new GeminiNLPAdapter();
  try {
    const res = await adapter.parseAsync("50k an sang");
    console.log(res);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
