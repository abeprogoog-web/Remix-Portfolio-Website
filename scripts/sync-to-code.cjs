const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const UPLOAD_DIR = path.join(ROOT, "uploads");
const PUBLIC_UPLOAD_DIR = path.join(ROOT, "public", "uploads");
const DIST_UPLOAD_DIR = path.join(ROOT, "dist", "uploads");
const SINGULAR_UPLOAD_DIR = path.join(ROOT, "upload");
const PUBLIC_SINGULAR_UPLOAD_DIR = path.join(ROOT, "public", "upload");
const DIST_SINGULAR_UPLOAD_DIR = path.join(ROOT, "dist", "upload");
const SRC_DATA_DIR = path.join(ROOT, "src", "data");
const DATA_DIR = path.join(ROOT, "data");

const SRC_DB_FILE = path.join(SRC_DATA_DIR, "db.json");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SEED_FILE = path.join(SRC_DATA_DIR, "seedData.ts");

console.log("=== SINKRONISASI DATA & GAMBAR KE CODEBASE ===");

// 1. Ensure directories exist
[PUBLIC_UPLOAD_DIR, DIST_UPLOAD_DIR, SRC_DATA_DIR, DATA_DIR, UPLOAD_DIR, SINGULAR_UPLOAD_DIR, PUBLIC_SINGULAR_UPLOAD_DIR, DIST_SINGULAR_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 2. Load latest DB
let currentDb = null;
const candidateFiles = [SRC_DB_FILE, DB_FILE, path.join(DATA_DIR, "db.backup.json"), path.join(SRC_DATA_DIR, "db.backup.json")];
for (const file of candidateFiles) {
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        currentDb = parsed;
        console.log(`Loaded database from: ${file} (${parsed.projects.length} projects)`);
        break;
      }
    } catch {}
  }
}

if (!currentDb) {
  console.error("Database file not found!");
  process.exit(1);
}

// 3. Copy all images in uploads & upload (recursively) to public and dist
let copiedCount = 0;

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  let count = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      count += copyRecursive(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
        count++;
      } catch (e) {
        console.warn(`Could not copy ${srcPath}:`, e.message);
      }
    }
  }
  return count;
}

copiedCount += copyRecursive(UPLOAD_DIR, PUBLIC_UPLOAD_DIR);
copiedCount += copyRecursive(UPLOAD_DIR, DIST_UPLOAD_DIR);
copiedCount += copyRecursive(PUBLIC_SINGULAR_UPLOAD_DIR, SINGULAR_UPLOAD_DIR);
copiedCount += copyRecursive(PUBLIC_SINGULAR_UPLOAD_DIR, DIST_SINGULAR_UPLOAD_DIR);
copiedCount += copyRecursive(PUBLIC_SINGULAR_UPLOAD_DIR, PUBLIC_UPLOAD_DIR);

console.log(`Synchronized ${copiedCount} files recursively across upload directories.`);

// 4. Save DB JSON to all locations
const jsonStr = JSON.stringify(currentDb, null, 2);
fs.writeFileSync(SRC_DB_FILE, jsonStr);
fs.writeFileSync(DB_FILE, jsonStr);
fs.writeFileSync(path.join(DATA_DIR, "db.backup.json"), jsonStr);
fs.writeFileSync(path.join(SRC_DATA_DIR, "db.backup.json"), jsonStr);

// 5. Update seedData.ts to ensure permanent TypeScript inclusion
const seedContent = `// Auto-generated preserved dataset to ensure all images, settings, and project data are permanently kept in code
export const PRESERVED_STUDIO_DATA = ${jsonStr};
`;
fs.writeFileSync(SEED_FILE, seedContent);

console.log(`Updated seedData.ts with ${currentDb.projects.length} projects.`);
console.log("=== SINKRONISASI SUKSES 100% ===");
