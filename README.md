# OpenSource.ngo License Library

Source and static build for https://licenses.opensource.ngo, built with Docusaurus.

## Development

Use Node.js 22 and npm.

```sh
npm ci
npm start
```

License documents are in `docs/`, interface code is in `src/`, and source assets are in `static/`.

## Validation and build

```sh
npm test
npm run build
```

The build generates license data, the search index, badges, and the static site in `build/` inside this repository. Generated output is ignored by Git; edit the source files instead.

Pushes to `main` run the tests, build the site, and deploy `build/` with `.github/workflows/pages.yml`. GitHub Pages uses GitHub Actions as its publishing source, with the custom domain `licenses.opensource.ngo`. No separate static repository is required.
