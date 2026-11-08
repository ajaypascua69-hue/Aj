#!/usr/bin/env python3
"""Collect short metadata from explicitly allowlisted official RSS/Atom feeds.
No article crawling, AI-generated claims, or third-party dependencies.
"""
import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = json.loads((ROOT / "knowledge" / "sources.json").read_text(encoding="utf-8"))
OUT = ROOT / "knowledge" / "auto-feed.json"
MAX_SUMMARY = 1200

class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)

def clean_text(value):
    parser = TextOnly()
    try:
        parser.feed(value or "")
        value = " ".join(parser.parts)
    except Exception:
        pass
    return re.sub(r"\\s+", " ", html.unescape(value)).strip()[:MAX_SUMMARY]

def local_name(tag):
    return tag.rsplit("}", 1)[-1].lower()

def child_text(node, names):
    for child in list(node):
        if local_name(child.tag) in names:
            if local_name(child.tag) == "link":
                href = child.attrib.get("href")
                if href:
                    return href.strip()
            return "".join(child.itertext()).strip()
    return ""

def parse_date(value):
    if not value:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        try:
            return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")
        except Exception:
            return None

def allowed_url(url, root_domain):
    try:
        parsed = urllib.parse.urlparse(url)
        host = (parsed.hostname or "").lower()
        return parsed.scheme == "https" and (host == root_domain or host.endswith("." + root_domain))
    except Exception:
        return False

def extract_entries(xml_bytes, source):
    root = ET.fromstring(xml_bytes)
    nodes = [n for n in root.iter() if local_name(n.tag) in ("item", "entry")]
    results = []
    for node in nodes[:int(SOURCES.get("max_items_per_source", 20))]:
        title = clean_text(child_text(node, {"title"}))
        link = child_text(node, {"link"})
        if link and not link.startswith("http"):
            link = urllib.parse.urljoin(source["feed"], link)
        if not title or not allowed_url(link, source["domain"]):
            continue
        summary = clean_text(child_text(node, {"description", "summary", "content", "encoded"}))
        published = parse_date(child_text(node, {"pubdate", "published", "updated", "date", "issued"}))
        identity = hashlib.sha256((source["domain"] + "|" + title.lower()).encode("utf-8")).hexdigest()[:20]
        results.append({
            "id": identity, "title": title, "summary": summary,
            "url": link, "published": published,
            "source": source["name"], "domain": source["domain"]
        })
    return results

def main():
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    entries, errors = [], []
    for source in SOURCES["sources"]:
        try:
            req = urllib.request.Request(source["feed"], headers={"User-Agent": "LEO-AI-Public-Feed-Indexer/1.0 (+https://ajaypascua69-hue.github.io/Aj/)", "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml"})
            with urllib.request.urlopen(req, timeout=25) as response:
                final_url = response.geturl()
                if not allowed_url(final_url, source["domain"]):
                    raise ValueError("Feed redirected outside its allowlisted domain")
                data = response.read(2_000_000)
            entries.extend(extract_entries(data, source))
        except Exception as exc:
            errors.append({"source": source["name"], "error": str(exc)[:240]})
    # A matching normalized headline from distinct allowlisted organizations is a
    # discovery signal only; it does not prove the underlying claim.
    groups = {}
    for item in entries:
        key = re.sub(r"[^a-z0-9]+", " ", item["title"].lower()).strip()
        groups.setdefault(key, set()).add(item["domain"])
    for item in entries:
        key = re.sub(r"[^a-z0-9]+", " ", item["title"].lower()).strip()
        count = len(groups.get(key, set()))
        item["independent_title_matches"] = count
        item["evidence_status"] = "matching-headline-across-sources" if count > 1 else "single-official-source"
        item["checked_at"] = now
    entries.sort(key=lambda x: x.get("published") or "", reverse=True)
    payload = {
        "schema_version": 1,
        "generated_at": now,
        "source_policy": "Allowlisted official RSS/Atom feeds only. Headlines and short feed summaries are unverified leads, not fact-checked knowledge. Matching titles are not proof of a claim.",
        "sources_checked": len(SOURCES["sources"]),
        "successful_sources": len(SOURCES["sources"]) - len(errors),
        "errors": errors,
        "items": entries[:300]
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")
    print(f"Wrote {len(payload['items'])} feed entries; {payload['successful_sources']}/{payload['sources_checked']} feeds succeeded.")

if __name__ == "__main__":
    main()
