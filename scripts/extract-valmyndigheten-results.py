#!/usr/bin/env python3
"""Extract district results from Valmyndigheten's official 2022 XLSX.

The workbook contains one row per party and district in the ``roster_RD``
sheet. This script emits turnout plus shares for the eight parties that won
Riksdag seats in 2022. Rows for every other party remain in the raw workbook
and are never copied to the client data.
"""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"
DOC_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

PARTIES = {
    "Moderaterna": "M",
    "Centerpartiet": "C",
    "Liberalerna (tidigare Folkpartiet)": "L",
    "Kristdemokraterna": "KD",
    "Miljöpartiet de gröna": "MP",
    "Arbetarepartiet-Socialdemokraterna": "S",
    "Vänsterpartiet": "V",
    "Sverigedemokraterna": "SD",
}


def column_name(reference: str) -> str:
    match = re.match(r"[A-Z]+", reference)
    if not match:
        raise ValueError(f"Invalid cell reference: {reference}")
    return match.group(0)


def shared_strings(workbook: zipfile.ZipFile) -> list[str]:
    root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
    return ["".join(item.itertext()) for item in root.findall(f"{NS}si")]


def roster_sheet_path(workbook: zipfile.ZipFile) -> str:
    root = ET.fromstring(workbook.read("xl/workbook.xml"))
    roster = next(
        sheet
        for sheet in root.findall(f".//{NS}sheet")
        if sheet.attrib.get("name") == "roster_RD"
    )
    relationship_id = roster.attrib[f"{DOC_REL}id"]
    relations = ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))
    target = next(
        item.attrib["Target"]
        for item in relations.findall(f"{REL_NS}Relationship")
        if item.attrib["Id"] == relationship_id
    )
    return f"xl/{target.lstrip('/')}"


def cell_value(cell: ET.Element, strings: list[str]):
    value = cell.find(f"{NS}v")
    if value is None:
        return None
    if cell.attrib.get("t") == "s":
        return strings[int(value.text)]
    if cell.attrib.get("t") in {"str", "inlineStr"}:
        return value.text
    return float(value.text)


def extract(input_path: Path) -> dict:
    with zipfile.ZipFile(input_path) as workbook:
        strings = shared_strings(workbook)
        sheet_path = roster_sheet_path(workbook)
        with workbook.open(sheet_path) as sheet:
            rows = ET.iterparse(sheet, events=("end",))
            headers: dict[str, str] | None = None
            districts: dict[str, dict] = {}
            data_rows = 0

            for _, element in rows:
                if element.tag != f"{NS}row":
                    continue
                values = {
                    column_name(cell.attrib["r"]): cell_value(cell, strings)
                    for cell in element.findall(f"{NS}c")
                }
                if headers is None:
                    headers = {
                        column: str(value).strip() for column, value in values.items()
                    }
                    element.clear()
                    continue

                row = {
                    headers[column]: value
                    for column, value in values.items()
                    if column in headers
                }
                district_id = str(row.get("Valdistriktskod", "")).strip()
                if not re.fullmatch(r"\d{8}", district_id):
                    element.clear()
                    continue

                name = str(row.get("Valdistriktnamn", "")).strip()
                party = str(row.get("Parti", "")).strip()
                votes = int(row.get("Röster", 0) or 0)
                eligible = int(row.get("Röstberättigade", 0) or 0)
                data_rows += 1
                record = districts.setdefault(
                    district_id,
                    {
                        "id": district_id,
                        "name": name,
                        "votes": None,
                        "eligible": None,
                        "validVotes": None,
                        "partyVotes": {},
                    },
                )
                if record["name"] != name:
                    raise ValueError(f"Conflicting names for {district_id}")

                if party in PARTIES:
                    code = PARTIES[party]
                    if code in record["partyVotes"]:
                        raise ValueError(f"Duplicate {code} row for {district_id}")
                    record["partyVotes"][code] = votes
                elif party == "Summa giltiga röster":
                    record["validVotes"] = votes
                elif party == "Valdeltagande":
                    record["votes"] = votes
                    record["eligible"] = eligible
                element.clear()

    output = []
    party_order = list(PARTIES.values())
    for district_id in sorted(districts):
        record = districts[district_id]
        eligible = record.pop("eligible")
        votes = record.pop("votes")
        valid_votes = record.pop("validVotes")
        party_votes = record.pop("partyVotes")
        if not eligible or votes is None or not valid_votes:
            raise ValueError(f"Missing totals for physical district {district_id}")
        parties = {
            code: 100 * party_votes.get(code, 0) / valid_votes for code in party_order
        }
        ranking = sorted(parties.items(), key=lambda item: (-item[1], item[0]))
        record.update(
            {
                "votes": votes,
                "eligible": eligible,
                "validVotes": valid_votes,
                "turnout": 100 * votes / eligible,
                "parties": parties,
                "leadingParty": ranking[0][0],
                "leadingShare": ranking[0][1],
                "runnerUpParty": ranking[1][0],
                "runnerUpShare": ranking[1][1],
            }
        )
        output.append(record)

    return {
        "source": input_path.name,
        "worksheet": "roster_RD",
        "method": (
            "join rows by 8-digit Valdistriktskod; turnout = Valdeltagande "
            "Röster / Röstberättigade; party shares = party Röster / "
            "Summa giltiga röster; retain only the eight parties seated in 2022"
        ),
        "dataRowsRead": data_rows,
        "districtCount": len(output),
        "partyCodes": party_order,
        "districts": output,
    }


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(
            "Usage: extract-valmyndigheten-results.py INPUT.xlsx OUTPUT.json"
        )
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = extract(input_path)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {payload['districtCount']} districts "
        f"from {payload['dataRowsRead']} workbook rows to {output_path}"
    )


if __name__ == "__main__":
    main()
