import os
import re
import subprocess
import sys

# Patterns of files that are cached by the Service Worker
CACHED_PATTERNS = [
    "recipes_with_heat.json",
    "recipes.json",
    "index.html",
    "styles.css",
    "js/",
    "manifest.json",
    "assets/",
]

def get_git_root():
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return output.strip()
    except subprocess.CalledProcessError:
        # Fallback to current directory
        return os.getcwd()

def get_modified_files():
    try:
        # Get list of modified and untracked files
        output = subprocess.check_output(["git", "status", "--porcelain"], text=True)
        files = []
        for line in output.splitlines():
            if len(line) > 3:
                # git status --porcelain output lines start with status code (2 chars) followed by space
                # e.g., " M js/app.js" or "?? assets/icon.svg"
                file_path = line[3:].strip()
                files.append(file_path)
        return files
    except subprocess.CalledProcessError:
        return []

def should_bump(modified_files):
    for f in modified_files:
        f = f.replace("\\", "/")
        if f == "sw.js":
            continue
        for pattern in CACHED_PATTERNS:
            if pattern.endswith("/"):
                if f.startswith(pattern):
                    return True
            else:
                if f == pattern:
                    return True
    return False

def increment_version(version_str):
    parts = version_str.split('.')
    try:
        parts[-1] = str(int(parts[-1]) + 1)
        return '.'.join(parts)
    except ValueError:
        try:
            val = float(version_str)
            return f"{val + 0.1:.1f}"
        except ValueError:
            return version_str + ".1"

def main():
    git_root = get_git_root()
    sw_path = os.path.join(git_root, "sw.js")
    
    if not os.path.exists(sw_path):
        print(f"Service worker file not found at {sw_path}")
        sys.exit(1)
        
    modified = get_modified_files()
    if not should_bump(modified):
        print("No cached assets have been modified. Service worker cache bump not required.")
        sys.exit(0)
        
    print("Detected modifications to cached assets.")
    
    with open(sw_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    pattern = r"(const\s+CACHE_NAME\s*=\s*['\"]thirty-recipes-v)([^'\"]+)(['\"];)"
    match = re.search(pattern, content)
    if not match:
        print("Could not find CACHE_NAME pattern in sw.js")
        sys.exit(1)
        
    prefix = match.group(1)
    current_version = match.group(2)
    suffix = match.group(3)
    
    new_version = increment_version(current_version)
    new_line = f"{prefix}{new_version}{suffix}"
    
    updated_content = re.sub(pattern, new_line, content)
    
    with open(sw_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
        
    print(f"Successfully bumped cache version in sw.js from '{current_version}' to '{new_version}'.")
    
    # Stage sw.js automatically
    try:
        subprocess.run(["git", "add", "sw.js"], cwd=git_root, check=True)
        print("Staged sw.js in Git.")
    except subprocess.CalledProcessError as e:
        print(f"Warning: Failed to automatically stage sw.js: {e}")

if __name__ == "__main__":
    main()
