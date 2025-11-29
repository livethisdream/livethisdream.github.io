import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# --- CONFIGURATION ---
# List the specific files you want to process (relative to repo root)
TARGET_FILES = [
    "pages/nr-wishlist.md"
    # Add additional files here
]

# Regex to find links that are on their own line: [Title](URL)
LINK_PATTERN = re.compile(r'^\s*[1\.]*\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\s*$', re.MULTILINE)
# ---------------------
import os
import re
import requests
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
TARGET_FILES = [
    "pages/nr-wishlist.md"
]

# Regex updated to capture:
# Group 1: Link Text (The Title Override)
# Group 2: URL
# Group 3: Optional Title Attribute (The Description/Note Override)
LINK_PATTERN = re.compile(r'^\s*\[([^\]]+)\]\((https?://[^\)\s]+)(?:\s+"([^"]+)")?\)\s*$', re.MULTILINE) # gemini
#LINK_PATTERN = re.compile(r'^\s*[1\.]*\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\s*$', re.MULTILINE) # this is me

# def get_opengraph_data(url, title_override=None, desc_override=None):
#     # If we have both overrides, we ONLY need the image, which saves processing time.
#     # But we usually still need to fetch the page to get the image.
#
#     try:
#         headers = {'User-Agent': 'Mozilla/5.0 (compatible; MyBlogLinkPreview/1.0)'}
#         response = requests.get(url, headers=headers, timeout=10)
#         response.raise_for_status()
#         soup = BeautifulSoup(response.text, 'html.parser')
#
#         def get_meta(prop):
#             tag = soup.find('meta', property=prop) or soup.find('meta', attrs={'name': prop})
#             return tag['content'] if tag else None
#
#         # Logic: Use override if provided, otherwise scrape
#         final_title = title_override if title_override else (get_meta('og:title') or soup.title.string or "Link")
#
#         final_desc = desc_override if desc_override else (get_meta('og:description') or get_meta('description') or "")
#
#         og_data = {
#             'title': final_title,
#             'description': final_desc,
#             'image': get_meta('og:image'), # We always try to scrape the image
#             'url': url
#         }
#         return og_data
#     except Exception as e:
#         print(f"Warning: Could not fetch {url} - {e}")
#         # If fetch fails but we have overrides, we can still generate a text-only card
#         if title_override:
#             return {
#                 'title': title_override,
#                 'description': desc_override if desc_override else "",
#                 'image': None,
#                 'url': url
#             }
#         return None

def get_opengraph_data(url, title_override=None, desc_override=None):
    try:
        #headers = {'User-Agent': 'Mozilla/5.0 (compatible; MyBlogLinkPreview/1.0)'}
        headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
                }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        def get_meta(prop):
            tag = soup.find('meta', property=prop) or soup.find('meta', attrs={'name': prop})
            return tag['content'] if tag else None

        # Logic: Use override if provided, otherwise scrape
        final_title = title_override if title_override else (get_meta('og:title') or soup.title.string or "Link")
        final_desc = desc_override if desc_override else (get_meta('og:description') or get_meta('description') or "")

        # --- FIX FOR RELATIVE IMAGES ---
        raw_image = get_meta('og:image')
        final_image = None
        if raw_image:
            # urljoin is smart: if raw_image is already absolute, it returns it as is.
            # If it's relative, it combines it with the base URL correctly.
            final_image = urljoin(url, raw_image)
        # -------------------------------

        og_data = {
            'title': final_title,
            'description': final_desc,
            'image': final_image,
            'url': url
        }
        return og_data
    except Exception as e:
        print(f"Warning: Could not fetch {url} - {e}")
        if title_override:
            return {
                'title': title_override,
                'description': desc_override if desc_override else "",
                'image': None,
                'url': url
            }
        return None

def create_html_card(data):
    img_html = f"""<div class="link-preview-image" style="background-image: url('{data['image']}');"></div>""" if data['image'] else ""

    return f"""
<div class="link-preview-card">
    <a href="{data['url']}" target="_blank" rel="noopener noreferrer">
        {img_html}
        <div class="link-preview-content">
            <h4 class="link-preview-title">{data['title']}</h4>
            <p class="link-preview-description">{data['description']}</p>
            <span class="link-preview-url">{data['url'].split('/')[2]}</span>
        </div>
    </a>
</div>
"""

def process_files():
    print("--- Starting Link Preview Generation ---")
    processed_count = 0

    for filepath in TARGET_FILES:
        if not os.path.exists(filepath):
            print(f"Skipping: {filepath} (File not found)")
            continue

        print(f"Scanning: {filepath}")

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        matches = LINK_PATTERN.findall(content)
        if not matches:
            continue

        new_content = content
        modified = False

        for text, url, note in matches:
            # Check if 'text' looks like a generic URL. If so, treat it as "No Title Override"
            # Otherwise, use 'text' as the custom title.
            title_override = text if text != url and not text.startswith('http') else None
            desc_override = note if note else None

            print(f"  > Processing: {url}")
            if title_override: print(f"    - Custom Title: {title_override}")
            if desc_override:  print(f"    - Custom Note: {desc_override}")

            data = get_opengraph_data(url, title_override, desc_override)

            if data:
                html_card = create_html_card(data)

                # Reconstruct the original string for replacement
                # We have to be careful to match exactly what regex found
                if note:
                    old_link_str = f'[{text}]({url} "{note}")'
                else:
                    old_link_str = f'[{text}]({url})'

                if old_link_str in new_content:
                    new_content = new_content.replace(old_link_str, html_card)
                    modified = True
                    processed_count += 1

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  > Updated {filepath}")

    print(f"--- Finished. Generated {processed_count} previews. ---")

if __name__ == "__main__":
    process_files()
