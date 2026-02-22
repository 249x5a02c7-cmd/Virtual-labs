import os

def fix_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()

        # The broken sequences are triple-encoded UTF-8 emojis.
        # Replace raw broken byte sequences with correct UTF-8 bytes for each emoji.
        byte_fixes = [
            # 📊 (bar chart) - triple-encoded as c383c2b0c385c2b8c3a2e282acc593c385c2a0
            (bytes.fromhex('c383c2b0c385c2b8c3a2e282acc593c385c2a0'), '📊'.encode('utf-8')),
            # 🎯 (bullseye) - triple-encoded as c383c2b0c385c2b8c3c5be c2af
            (bytes.fromhex('c383c2b0c385c2b8c3a2e282ac c593c385c2a0'.replace(' ','')), '📊'.encode('utf-8')),
            # ⚠️ warning - garbled as c3 83 c2 a2 c3 85 c2 a1 c3 82 c2 a0 c3 83 c2 af c3 82 c2 b8 c3 82 c2 a0
            (bytes.fromhex('c383c2a2c385c2a1c382c2a0c383c2afc382c2b8c382c2a0'), '⚠️'.encode('utf-8')),
            # ≈ (approx equal) - garbled as c3 83 c2 a2 c3 82 c2 86 c3 84 c2 88
            # The ≈ from corrupted double-encoding
            (bytes.fromhex('c383c2a2e2868e'), '≈'.encode('utf-8')),
            # °  degree symbol garbled as c383c2a2 e2 80 9a c2 b0 
            # try simpler
        ]

        for bad, good in byte_fixes:
            raw = raw.replace(bad, good)

        with open(filepath, 'wb') as f:
            f.write(raw)
        print(f'Fixed (raw): {os.path.basename(filepath)}')
    except Exception as e:
        print(f'Error in {filepath}: {e}')


def process_dir(d):
    for fn in os.listdir(d):
        if fn.endswith('.html'):
            fix_file(os.path.join(d, fn))

process_dir('c:/Users/varun/OneDrive/Desktop/duplicate')
process_dir('c:/Users/varun/OneDrive/Desktop/duplicate/experiments')

# Now do the text-level fixes
def clean_text(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        # Direct replacement of remaining broken section icon spans
        content = content.replace(
            '<span class="section-icon">ðŸ"\xa0</span> Sample Calculations',
            '<span class="section-icon">📊</span> Sample Calculations'
        )

        # Fix ⚠️ precautions bullets
        import re
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Ensure both machines',
            '⚠️ Ensure both machines',
            content
        )
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Check all connections',
            '⚠️ Check all connections',
            content
        )
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Start with minimum',
            '⚠️ Start with minimum',
            content
        )
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Do not exceed',
            '⚠️ Do not exceed',
            content
        )
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Ensure proper coupling',
            '⚠️ Ensure proper coupling',
            content
        )
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Monitor temperature',
            '⚠️ Monitor temperature',
            content
        )
        content = re.sub(
            r'[^\x00-\x7F]{5,30} Adjust fields',
            '⚠️ Adjust fields',
            content
        )

        # Fix remaining ≈ and degree issues
        content = re.sub(r'\u00c3\u00a2\u00e2\u0086\u008e', '\u2248', content)
        content = content.replace('Ãƒâ€¹Ã…â€œ', '≈')
        content = content.replace('Ãƒâ€šÃ‚°', '°')
        content = content.replace('Ãƒâ€š°', '°')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Text-cleaned: {os.path.basename(filepath)}')
    except Exception as e:
        print(f'Text error in {filepath}: {e}')

process_dir2 = process_dir

def process_text_dir(d):
    for fn in os.listdir(d):
        if fn.endswith('.html'):
            clean_text(os.path.join(d, fn))

process_text_dir('c:/Users/varun/OneDrive/Desktop/duplicate')
process_text_dir('c:/Users/varun/OneDrive/Desktop/duplicate/experiments')
print('All complete.')
