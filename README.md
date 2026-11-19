# doShare

Static HTML pages published with GitHub Pages at https://khalender.github.io/doShare/.

This repo is public, and so is every page in it. Don't put private specs, credentials or customer data here.

## Add a page

Put an `.html` file (or a folder with its CSS, JS and images) under `pages/` and push to `main`.
Or use the helper, which copies, commits, pushes and prints the URL:

```bash
./publish.sh report.html
./publish.sh -d doslim prototype.html   # goes to pages/doslim/
```

A GitHub Actions workflow (`.github/workflows/pages.yml`) runs `tools/build_index.py` on every push.
The script copies `pages/` to `_site/` and writes `index.html`, listing every page by its `<title>`,
grouped by folder, with the date of its last commit. A page shows up about a minute after the push.

## Build locally

```bash
python3 tools/build_index.py
python3 -m http.server -d _site 8000
```
