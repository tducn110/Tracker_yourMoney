import os
import re

base_path = '/home/tducn/finance-for-me-local/awesome-azimuth/src/content/docs/doc'

def fix_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return
    
    # Remove any existing frontmatter that might be broken
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        content_body = content[match.end():]
    else:
        content_body = content

    # Find title
    title_match = re.search(r'^#\s+(.*)$', content_body, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()
    else:
        title = os.path.basename(file_path).replace('.md', '').replace('-', ' ').title()
    
    # Escape double quotes in title
    escaped_title = title.replace('"', '\\"')
    
    new_content = f'---\ntitle: "{escaped_title}"\n---\n\n' + content_body
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Refixed: {file_path}")

if os.path.exists(base_path):
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.md'):
                fix_file(os.path.join(root, file))
