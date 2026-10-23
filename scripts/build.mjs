import { build, context } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const dev = process.argv.includes('--dev');
const watch = process.argv.includes('--watch');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const apiBase = process.env.API_BASE_URL || (dev ? 'http://localhost:8000' : 'https://api.examsdk.com');

const define = {
  __DEV__: JSON.stringify(dev),
  __API_BASE_URL__: JSON.stringify(apiBase),
  __EXTENSION_VERSION__: JSON.stringify(pkg.version),
};

const shared = {
  bundle: true,
  sourcemap: true,
  target: ['chrome114'],
  platform: 'browser',
  logLevel: 'info',
  define,
  absWorkingDir: root,
};

const entries = [
  {
    label: 'service-worker',
    entryPoints: ['src/background/service-worker.ts'],
    outfile: 'background/service-worker.js',
    format: 'esm',
  },
  {
    label: 'host-gate',
    entryPoints: ['src/content-scripts/hostGate.ts'],
    outfile: 'content-scripts/hostGate.js',
    format: 'iife',
  },
  {
    label: 'bridge',
    entryPoints: ['src/content-scripts/bridge.ts'],
    outfile: 'content-scripts/bridge.js',
    format: 'esm',
  },
  {
    label: 'popup',
    entryPoints: ['src/popup/popup.ts'],
    outfile: 'popup/popup.js',
    format: 'iife',
  },
];

function copyStatic() {
  mkdirSync(resolve(dist, 'popup'), { recursive: true });
  mkdirSync(resolve(dist, 'content-scripts'), { recursive: true });
  mkdirSync(resolve(dist, 'background'), { recursive: true });
  cpSync(resolve(root, 'manifest.json'), resolve(dist, 'manifest.json'));
  cpSync(resolve(root, 'public/_locales'), resolve(dist, '_locales'), { recursive: true });
  cpSync(resolve(root, 'public/icons'), resolve(dist, 'icons'), { recursive: true });
  cpSync(resolve(root, 'src/popup/popup.html'), resolve(dist, 'popup/popup.html'));
  cpSync(resolve(root, 'src/popup/popup.css'), resolve(dist, 'popup/popup.css'));
}

rmSync(dist, { recursive: true, force: true });
copyStatic();

if (watch) {
  const contexts = await Promise.all(
    entries.map(({ label, ...options }) =>
      context({ ...shared, ...options, outfile: resolve(dist, options.outfile) }).then(
        (ctx) => ({ label, ctx }),
      ),
    ),
  );
  await Promise.all(contexts.map(({ ctx }) => ctx.watch()));
  console.log(`Extension build (dev=${dev}) en veille sur ${contexts.length} entrées.`);
} else {
  await Promise.all(
    entries.map(({ label, ...options }) =>
      build({ ...shared, ...options, outfile: resolve(dist, options.outfile) }),
    ),
  );
  console.log(`Extension construite dans dist/ (dev=${dev}, api=${apiBase}).`);
}
