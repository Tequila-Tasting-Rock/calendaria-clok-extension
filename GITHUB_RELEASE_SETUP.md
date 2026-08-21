# GitHub Release Setup

1. Create a GitHub repository named `phil-style-clock`.
2. Replace `YOUR_USERNAME` and `YOUR_NAME` in `module.json` and `README.md`.
3. Commit and push the repository.
4. Create a tag such as `v1.0.0`.
5. Push the tag:
   `git push origin v1.0.0`
6. GitHub Actions runs `.github/workflows/release.yml`.
7. The workflow creates a GitHub Release containing:
   - `module.json`
   - `module.zip`

## Foundry Manifest URL

Use this stable URL in Foundry:

`https://github.com/YOUR_USERNAME/phil-style-clock/releases/latest/download/module.json`

Do NOT use the GitHub `/blob/` HTML URL.

## Versioning

Use semantic version tags:

- `v1.0.0` = first stable release
- `v1.1.0` = new features
- `v1.0.1` = bug fix
- `v2.0.0` = breaking change

The workflow strips the leading `v` and writes `1.0.0` into the release manifest.

## Important

The release `download` URL is version-specific:

`https://github.com/YOUR_USERNAME/phil-style-clock/releases/download/v1.0.0/module.zip`

The `manifest` URL is also release-specific inside that released `module.json`, while users install/update through:

`https://github.com/YOUR_USERNAME/phil-style-clock/releases/latest/download/module.json`
