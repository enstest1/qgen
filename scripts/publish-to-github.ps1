# Run from the extracted project root, after creating a NEW EMPTY private repository
# at https://github.com/enstest1/qgen . No force pushes; no token logging.
$ErrorActionPreference='Stop'
$repo='https://github.com/enstest1/qgen.git'
if (-not (Test-Path './package.json')) { throw 'Run from the extracted qgen project root.' }
if (Test-Path './.git') { throw 'Already a Git repository. Inspect the remote manually before pushing.' }
if (-not (git config --global user.name)) { throw 'Configure your Git name with git config --global user.name "Your Name" first.' }
if (-not (git config --global user.email)) { throw 'Configure your Git email with git config --global user.email first.' }
Write-Host 'Running verification...'
npm test; if ($LASTEXITCODE -ne 0) { throw 'Tests failed. Aborting push.' }
npm run validate; if ($LASTEXITCODE -ne 0) { throw 'Artwork validation failed. Aborting push.' }
Write-Host 'Creating initial main branch commit in the NEW project...'
git init -b main; if ($LASTEXITCODE -ne 0) { throw 'Git init failed.' }
git add .; if ($LASTEXITCODE -ne 0) { throw 'Git add failed.' }
git commit -m 'feat: QGEN deterministic Quark PFP developer handoff'; if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
git remote add origin $repo; if ($LASTEXITCODE -ne 0) { throw 'Adding GitHub remote failed.' }
git push -u origin main; if ($LASTEXITCODE -ne 0) { throw 'Push failed. Check new repo exists and is empty; do not force push.' }
Write-Host 'Published at https://github.com/enstest1/qgen'
