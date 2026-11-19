#!/usr/bin/env python3
"""Build the site: copy pages/ into _site/ and write _site/index.html listing every page.

Run from the repo root: python3 tools/build_index.py
"""
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "pages"
SITE = ROOT / "_site"
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)


def page_title(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="replace")[:20000]
    m = TITLE_RE.search(text)
    if m:
        title = " ".join(html.unescape(m.group(1)).split())
        if title:
            return title
    return path.stem.replace("-", " ").replace("_", " ")


def last_change(path: Path) -> str:
    """Date of the last commit that touched the file, or empty when git has none."""
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(path)],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return out
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def main() -> None:
    if SITE.exists():
        shutil.rmtree(SITE)
    shutil.copytree(PAGES, SITE)
    (SITE / ".nojekyll").touch()

    entries = []
    for path in sorted(PAGES.rglob("*.html")):
        rel = path.relative_to(PAGES).as_posix()
        if rel == "index.html":
            continue
        folder = path.parent.relative_to(PAGES).as_posix()
        entries.append({
            "href": rel,
            "title": page_title(path),
            "folder": "" if folder == "." else folder,
            "date": last_change(path),
        })

    template = (ROOT / "tools" / "index.template.html").read_text(encoding="utf-8")
    payload = json.dumps(entries, ensure_ascii=False).replace("</", "<\\/")
    (SITE / "index.html").write_text(template.replace("__PAGES__", payload), encoding="utf-8")
    print(f"{len(entries)} pages -> {SITE}")


if __name__ == "__main__":
    main()
