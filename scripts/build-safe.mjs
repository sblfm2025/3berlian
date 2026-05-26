import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = path.resolve(process.cwd());
const safeRoot = path.join(os.tmpdir(), '3berlian-build-safe');

const runBuild = () => {
  const result = spawnSync(process.execPath, [path.join(safeRoot, 'node_modules/vite/bin/vite.js'), 'build'], {
    stdio: 'inherit',
    cwd: safeRoot
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

try {
  if (fs.existsSync(safeRoot)) {
    fs.rmSync(safeRoot, { recursive: true, force: true });
  }

  fs.cpSync(projectRoot, safeRoot, {
    recursive: true,
    force: true,
    filter: (source) => {
      const relativePath = path.relative(projectRoot, source);
      if (!relativePath) return true;
      return !['.git', '.sixth', 'dist'].some(folder => relativePath === folder || relativePath.startsWith(`${folder}${path.sep}`));
    }
  });
  runBuild();

  const distSource = path.join(safeRoot, 'dist');
  const distTarget = path.join(projectRoot, 'dist');

  if (fs.existsSync(distTarget)) {
    fs.rmSync(distTarget, { recursive: true, force: true });
  }

  fs.cpSync(distSource, distTarget, { recursive: true, force: true });
} finally {
  if (fs.existsSync(safeRoot)) {
    fs.rmSync(safeRoot, { recursive: true, force: true });
  }
}
