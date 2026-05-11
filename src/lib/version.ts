import semver from 'semver'

const PACKAGE_NAME = '@slax-lab/slax-reader-cli'

interface NpmRegistryVersion {
  'dist-tags': {
    latest: string
  }
}

export async function getLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { version: string }
    return data.version ?? null
  } catch {
    return null
  }
}

export function isNewer(current: string, latest: string): boolean {
  return semver.gt(latest, current)
}

export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  const latest = await getLatestVersion()
  if (latest && isNewer(currentVersion, latest)) {
    return latest
  }
  return null
}
