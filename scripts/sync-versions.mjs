import { readFileSync, writeFileSync } from 'fs'

const version = process.argv[2]
if (!version) {
  console.error('Usage: node scripts/sync-versions.mjs <version>')
  process.exit(1)
}

const paths = ['apps/web/package.json', 'apps/api/package.json']

for (const p of paths) {
  const pkg = JSON.parse(readFileSync(p, 'utf8'))
  pkg.version = version
  writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`synced ${p} → ${version}`)
}
