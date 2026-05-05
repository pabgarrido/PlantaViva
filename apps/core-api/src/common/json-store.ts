import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const logger = new Logger('JsonStore');

/** Simple JSON file store — persists data to .data/ directory */
export class JsonStore<T> {
  private filePath: string;
  private data: Map<string, T>;

  constructor(name: string) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = this.load();
    logger.log(`Store "${name}": loaded ${this.data.size} records from ${this.filePath}`);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  set(key: string, value: T): void {
    this.data.set(key, value);
    this.persist();
  }

  delete(key: string): boolean {
    const result = this.data.delete(key);
    if (result) this.persist();
    return result;
  }

  values(): T[] {
    return Array.from(this.data.values());
  }

  entries(): [string, T][] {
    return Array.from(this.data.entries());
  }

  get size(): number {
    return this.data.size;
  }

  private load(): Map<string, T> {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return new Map(Object.entries(parsed));
      }
    } catch (err: any) {
      logger.warn(`Failed to load ${this.filePath}: ${err.message}`);
    }
    return new Map();
  }

  private persist(): void {
    try {
      const obj: Record<string, T> = {};
      for (const [k, v] of this.data) {
        obj[k] = v;
      }
      fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err: any) {
      logger.error(`Failed to persist ${this.filePath}: ${err.message}`);
    }
  }
}
