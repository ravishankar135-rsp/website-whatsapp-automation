
import json
import sys


def process_news(news):
    """Validate and clean RSS news data."""

    if not isinstance(news, dict):
        raise ValueError("News data must be a JSON object")

    title = str(news.get("title") or "").strip()
    link = str(news.get("link") or "").strip()
    description = str(news.get("description") or "").strip()

    if not title:
        raise ValueError("News title is missing")

    if not link.startswith(("https://", "http://")):
        raise ValueError("Invalid news link")

    return {
        "title": title,
        "link": link,
        "description": description
    }


if __name__ == "__main__":
    try:
        news_data = json.loads(sys.stdin.read())
        result = process_news(news_data)

        print(json.dumps(result, ensure_ascii=False))

    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
