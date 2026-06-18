---
name: json-cleanup
description: Cleans and formats malformed recipes JSON exported into markdown files in the project, correcting bracket and underscore escapes, merging arrays, and formatting decimals.
---
# JSON Cleanup Skill

This skill provides instructions and a script for cleaning up malformed JSON data, specifically targeting markdown-escaped brackets/underscores, concatenated arrays, and formatting standardizations for recipes data.

## Features

1. **Markdown Unescaping**: Replaces escaped characters like `\[`, `\]`, and `\_` with their actual JSON equivalents `[`, `]`, and `_`.
2. **Array Merging**: Resolves issues with multiple concatenated JSON arrays (e.g., `][` boundaries) by joining them into a single valid JSON array.
3. **Decimal Enforcement**: Standardizes ingredient `amount` fields to float types.
4. **Instruction Line-Break Cleaning**: Replaces hard line breaks (`\n` and `\r`) in step instructions with space characters.
5. **Indentation Formatting**: Formats the output JSON with a clean 4-space indentation layout.
6. **Deduplication**: Removes duplicate recipe objects with exactly identical `id` keys, keeping the first occurrence, removing subsequent ones, and logging details.

## Custom Slash Command

You can trigger this skill directly in the chat using:
- `/json-cleanup`

When you type `/json-cleanup`, the AI assistant will run this cleanup process on the project's recipes file.

## Location

- Script location: [clean_recipes.py](file:///g:/My%20Drive/30%20Minute%20Recipes/skills/json-cleanup/scripts/clean_recipes.py)

## Usage

You can run the cleanup script manually from the project root using `python`:

```powershell
python "skills/json-cleanup/scripts/clean_recipes.py" "Recipes JSON.md" --output-json "Recipes JSON.json" --output-md "Recipes JSON.md"
```

### Options

- `input_file` (positional): Path to the input malformed JSON file (e.g. `Recipes JSON.md`).
- `--output-json`: Path to write the cleaned and pretty-printed `.json` file.
- `--output-md`: Path to overwrite/write the cleaned `.md` file.
- `--no-backup`: Skip creating a backup (`.bak`) of the input file before cleaning.
