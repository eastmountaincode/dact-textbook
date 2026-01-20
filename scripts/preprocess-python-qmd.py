#!/usr/bin/env python3
"""
Preprocess QMD files: Execute Python code blocks and insert output.

This script:
1. Parses QMD files looking for ```python code blocks
2. Executes them in sequence (maintaining state between blocks in same file)
3. Captures stdout and inserts it as output blocks
4. Detects plt.savefig() calls and adds image references

Output blocks are marked with special comments so they can be regenerated:
    <!-- AUTO-OUTPUT-START -->
    ```
    output here
    ```
    <!-- AUTO-OUTPUT-END -->

Usage:
    python preprocess-python-qmd.py [path/to/file.qmd]
    python preprocess-python-qmd.py  # processes all QMD files with python blocks
"""

import re
import sys
import os
from pathlib import Path
from io import StringIO
from contextlib import redirect_stdout
import traceback

# Set matplotlib to non-interactive backend BEFORE any other imports
# This prevents plt.show() from blocking execution
import matplotlib
matplotlib.use('Agg')

# Project paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
QMD_DIR = PROJECT_ROOT / "content" / "chapters"

# Markers for auto-generated output
OUTPUT_START = "<!-- AUTO-OUTPUT-START -->"
OUTPUT_END = "<!-- AUTO-OUTPUT-END -->"

def find_python_code_blocks(content):
    """
    Find all Python code blocks in QMD content.
    Returns list of (start_pos, end_pos, code) tuples.
    """
    # Match ```python ... ``` blocks (not ```{python} which is Quarto-style)
    pattern = r'```python\n(.*?)```'
    blocks = []
    for match in re.finditer(pattern, content, re.DOTALL):
        blocks.append({
            'start': match.start(),
            'end': match.end(),
            'code': match.group(1),
            'full_match': match.group(0)
        })
    return blocks


def remove_existing_output(content):
    """
    Remove any existing auto-generated output blocks.
    """
    pattern = f'{re.escape(OUTPUT_START)}.*?{re.escape(OUTPUT_END)}'
    return re.sub(pattern, '', content, flags=re.DOTALL)


def extract_savefig_path(code):
    """
    Extract the path from plt.savefig() call if present.
    Returns the path string or None.
    """
    # Match plt.savefig('path') or plt.savefig("path")
    match = re.search(r"plt\.savefig\(['\"]([^'\"]+)['\"]", code)
    if match:
        return match.group(1)
    return None


def execute_code_blocks(blocks, working_dir):
    """
    Execute code blocks in sequence, capturing output.
    Returns list of outputs (one per block).
    """
    # Shared namespace for all blocks in the file
    namespace = {'__name__': '__main__'}

    # Pre-import matplotlib with Agg backend and make plt.show() a no-op
    # This ensures executed code doesn't block waiting for figure windows
    try:
        import matplotlib.pyplot as plt
        plt.switch_backend('Agg')
        namespace['plt'] = plt
        # Also inject a no-op show function in case code calls plt.show()
        original_show = plt.show
        plt.show = lambda *args, **kwargs: None
    except ImportError:
        pass

    outputs = []

    # Change to working directory for relative paths (figures)
    original_dir = os.getcwd()
    os.chdir(working_dir)

    try:
        for block in blocks:
            code = block['code']
            stdout_capture = StringIO()

            try:
                # Capture stdout
                with redirect_stdout(stdout_capture):
                    exec(code, namespace)

                output = stdout_capture.getvalue()

                # Check for savefig to add image reference
                fig_path = extract_savefig_path(code)

                outputs.append({
                    'stdout': output.strip() if output.strip() else None,
                    'figure': fig_path,
                    'error': None
                })

            except Exception as e:
                error_msg = f"Error executing code block:\n{traceback.format_exc()}"
                outputs.append({
                    'stdout': stdout_capture.getvalue().strip() or None,
                    'figure': None,
                    'error': error_msg
                })
                print(f"Warning: {error_msg}", file=sys.stderr)
    finally:
        os.chdir(original_dir)

    return outputs


def insert_outputs(content, blocks, outputs):
    """
    Insert output blocks after each code block.
    Works backwards to preserve positions.
    """
    # Process in reverse order to preserve positions
    for block, output in reversed(list(zip(blocks, outputs))):
        insert_pos = block['end']

        # Build output section
        output_parts = []

        # Add stdout if present
        if output['stdout']:
            output_parts.append(f"```\n{output['stdout']}\n```")

        # Add figure reference if present
        if output['figure']:
            # Extract just filename for alt text
            fig_name = Path(output['figure']).stem.replace('_', ' ').title()
            output_parts.append(f"\n![{fig_name}]({output['figure']})")

        # Add error if present
        if output['error']:
            output_parts.append(f"```\n[Execution Error]\n{output['error']}\n```")

        if output_parts:
            output_section = f"\n\n{OUTPUT_START}\n" + "\n".join(output_parts) + f"\n{OUTPUT_END}"
            content = content[:insert_pos] + output_section + content[insert_pos:]

    return content


def process_qmd_file(qmd_path):
    """
    Process a single QMD file: execute Python blocks and insert output.
    """
    qmd_path = Path(qmd_path)
    print(f"Processing: {qmd_path.name}")

    with open(qmd_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove any existing auto-generated output
    content = remove_existing_output(content)

    # Find Python code blocks
    blocks = find_python_code_blocks(content)

    if not blocks:
        print(f"  No Python code blocks found")
        return False

    print(f"  Found {len(blocks)} Python code blocks")

    # Execute code blocks
    working_dir = qmd_path.parent
    outputs = execute_code_blocks(blocks, working_dir)

    # Insert outputs
    new_content = insert_outputs(content, blocks, outputs)

    # Write back
    with open(qmd_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # Report
    successful = sum(1 for o in outputs if o['error'] is None)
    with_output = sum(1 for o in outputs if o['stdout'])
    with_figures = sum(1 for o in outputs if o['figure'])

    print(f"  Executed: {successful}/{len(blocks)} blocks")
    print(f"  Output blocks added: {with_output}")
    print(f"  Figure references added: {with_figures}")

    return True


def find_qmd_files_with_python():
    """
    Find all QMD files that contain Python code blocks.
    """
    qmd_files = []
    for qmd_file in QMD_DIR.rglob("index.qmd"):
        with open(qmd_file, 'r', encoding='utf-8') as f:
            content = f.read()
        if '```python' in content:
            qmd_files.append(qmd_file)
    return qmd_files


def main():
    if len(sys.argv) > 1:
        # Process specific file
        qmd_path = Path(sys.argv[1])
        if not qmd_path.exists():
            print(f"Error: File not found: {qmd_path}")
            sys.exit(1)
        process_qmd_file(qmd_path)
    else:
        # Process all QMD files with Python blocks
        print("Searching for QMD files with Python code blocks...")
        qmd_files = find_qmd_files_with_python()

        if not qmd_files:
            print("No QMD files with Python code blocks found.")
            return

        print(f"Found {len(qmd_files)} files to process:\n")

        for qmd_file in qmd_files:
            process_qmd_file(qmd_file)
            print()

        print("Preprocessing complete.")


if __name__ == "__main__":
    main()
