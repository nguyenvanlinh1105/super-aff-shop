import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "prisma", "dev.db")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "prisma", "sqlite_dump.json")

def dump():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma%'")
    tables = [r[0] for r in cur.fetchall()]

    data = {}
    for table in tables:
        cur.execute(f'SELECT * FROM "{table}"')
        rows = [dict(row) for row in cur.fetchall()]
        data[table] = rows
        print(f"Table '{table}': {len(rows)} rows")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDump saved successfully to {OUTPUT_PATH}")

if __name__ == "__main__":
    dump()
