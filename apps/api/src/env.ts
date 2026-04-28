import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  const result = config({ path: path.resolve(__dirname, "../../../.env") });
  // No need for console logs here, the app will fail later if vars are missing
}
