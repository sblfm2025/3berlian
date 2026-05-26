import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const backupRoot = path.join(rootDir, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(backupRoot, `project-backup-${timestamp}`);

const includes = [
  'src',
  'public',
  'scripts',
  'SODARA_3BERLIAN_DEVELOPER_BLUEPRINT_MD',
  '3BERLIAN_FINAL_BLUEPRINT_READY',
  'CODEX_CONTINUATION_HANDOFF.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'vite.config.js',
  'eslint.config.js'
];

const optionalGit = (args) => {
  try {
    return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const exists = async (targetPath) => {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
};

const countFiles = async (targetPath) => {
  const targetStat = await stat(targetPath);
  if (!targetStat.isDirectory()) return 1;

  const entries = await readdir(targetPath, { withFileTypes: true });
  let total = 0;

  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    total += entry.isDirectory() ? await countFiles(entryPath) : 1;
  }

  return total;
};

await mkdir(backupDir, { recursive: true });

const copied = [];
let fileCount = 0;

for (const item of includes) {
  const sourcePath = path.join(rootDir, item);
  if (!(await exists(sourcePath))) continue;

  const destinationPath = path.join(backupDir, item);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath, { recursive: true });

  copied.push(item);
  fileCount += await countFiles(sourcePath);
}

const manifest = {
  createdAt: new Date().toISOString(),
  backupDir,
  gitCommit: optionalGit(['rev-parse', '--short', 'HEAD']),
  gitBranch: optionalGit(['branch', '--show-current']),
  gitStatus: optionalGit(['status', '--short']),
  copied,
  fileCount
};

await writeFile(path.join(backupDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`Backup proyek dibuat: ${backupDir}`);
console.log(`Item disalin: ${copied.length}`);
console.log(`File disalin: ${fileCount}`);
