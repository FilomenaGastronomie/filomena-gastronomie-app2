import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = path.join(dataDir, fileName);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, data: T) {
  const filePath = path.join(dataDir, fileName);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
