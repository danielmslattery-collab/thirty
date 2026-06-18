import json
import re
import os
import shutil
import argparse

def clean_recipes_json(input_filepath, output_json_filepath=None, output_md_filepath=None, create_backup=True):
    # Read the raw, malformed JSON text
    with open(input_filepath, 'r', encoding='utf-8') as f:
        raw_text = f.read()
    
    if create_backup:
        backup_filepath = input_filepath + '.bak'
        shutil.copyfile(input_filepath, backup_filepath)
        print(f"Backup created at: {backup_filepath}")

    # Fix markdown escaping
    clean_text = raw_text.replace(r'\[', '[').replace(r'\]', ']').replace(r'\_', '_')

    # Fix concatenated arrays (replace ] followed by [ with a comma)
    clean_text = re.sub(r'\]\s*\[', ',', clean_text)
    
    # Parse the unified JSON array
    try:
        recipes = json.loads(clean_text, strict=False)
    except json.JSONDecodeError as e:
        print(f"Parse failed. Error: {e}")
        return

    # Enforce strict decimal logic and clean line breaks
    for recipe in recipes:
        # Enforce floats on all amount fields
        for ingredient in recipe.get('ingredients', []):
            if 'amount' in ingredient:
                ingredient['amount'] = float(ingredient['amount'])
        
        # Strip hard returns and replace with spaces in instructions
        for step in recipe.get('steps', []):
            if 'instruction' in step and isinstance(step['instruction'], str):
                step['instruction'] = step['instruction'].replace('\n', ' ').replace('\r', '')

    # Deduplicate recipes by ID, keeping the first occurrence
    seen_ids = set()
    deduplicated_recipes = []
    removed_ids = []
    
    for recipe in recipes:
        recipe_id = recipe.get('id')
        if recipe_id in seen_ids:
            removed_ids.append(recipe_id)
        else:
            seen_ids.add(recipe_id)
            deduplicated_recipes.append(recipe)
            
    recipes = deduplicated_recipes
    if removed_ids:
        print(f"Removed {len(removed_ids)} duplicate recipes:")
        for r_id in removed_ids:
            print(f"  - {r_id}")
    else:
        print("No duplicate recipes found.")

    # Output the strictly compliant JSON files
    if output_json_filepath:
        with open(output_json_filepath, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=4, ensure_ascii=False)
        print(f"Successfully saved clean JSON to {output_json_filepath}")
        
    if output_md_filepath:
        with open(output_md_filepath, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=4, ensure_ascii=False)
        print(f"Successfully saved clean JSON to {output_md_filepath}")
        
    print(f"Successfully cleaned {len(recipes)} recipes.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean and format Recipes JSON files in the project.")
    parser.add_argument("input_file", help="Path to the raw/malformed recipes file (e.g. Recipes JSON.md)")
    parser.add_argument("--output-json", help="Path to write the cleaned .json file")
    parser.add_argument("--output-md", help="Path to write the cleaned .md file")
    parser.add_argument("--no-backup", action="store_true", help="Skip creating a backup file")
    
    args = parser.parse_args()
    
    clean_recipes_json(
        args.input_file,
        args.output_json,
        args.output_md,
        create_backup=not args.no_backup
    )
