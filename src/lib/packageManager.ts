import { execSync } from 'node:child_process'

const PACKAGE_NAME = '@slax-lab/reader-cli'

export function detectPackageManager(): 'pnpm' | 'npm' {
  try {
    execSync('pnpm --version', { stdio: 'pipe' })
    return 'pnpm'
  } catch {
    return 'npm'
  }
}

export function buildInstallCommand(pm: 'pnpm' | 'npm', pkg: string = PACKAGE_NAME): string {
  return pm === 'pnpm'
    ? `pnpm add -g ${pkg}@latest`
    : `npm install -g ${pkg}@latest`
}
