import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    const label = [command, ...args].join(' ');
    throw new Error(`Command failed: ${label}`);
  }
}

function canUseSupabaseCli() {
  const result = spawnSync(npxCommand, ['supabase', 'projects', 'list'], {
    stdio: 'ignore',
  });

  return result.status === 0;
}

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function getLinkedProjectRef() {
  const candidates = [
    resolve(process.cwd(), 'supabase/.temp/project-ref'),
    resolve(process.cwd(), 'supabase/.temp/linked-project.json'),
  ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const raw = readFileSync(candidate, 'utf8').trim();
    if (!raw) continue;

    if (candidate.endsWith('.json')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.ref) return parsed.ref;
      } catch {
        // fall through to next candidate
      }
    } else {
      return raw;
    }
  }

  return null;
}

const projectRef = getArg('project-ref') || getLinkedProjectRef();
const skipLogin = process.argv.includes('--skip-login');

if (!projectRef) {
  console.error('No Supabase project ref found. Pass --project-ref=<ref> or run `npx supabase link` once first.');
  process.exit(1);
}

try {
  console.log(`Using Supabase project ref: ${projectRef}`);
  if (!skipLogin && !canUseSupabaseCli()) {
    console.log('Supabase CLI is not authenticated yet. Running login once...');
    run(npxCommand, ['supabase', 'login']);
  }
  run(npxCommand, ['supabase', 'link', '--project-ref', projectRef]);
  run(npxCommand, ['supabase', 'db', 'push']);
  console.log('Supabase schema push completed successfully.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
