#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-}"
BUNDLE_ID="${BUNDLE_ID:-}"
PROJECT_FILE="ios/ChitongInternal/ChitongInternal.xcodeproj/project.pbxproj"

if [[ -z "$APP_URL" || -z "$BUNDLE_ID" ]]; then
  echo "Usage:"
  echo "  APP_URL=https://hr.company.local BUNDLE_ID=com.yourcompany.hr scripts/configure-ios.sh"
  exit 1
fi

python3 - "$PROJECT_FILE" "$APP_URL" "$BUNDLE_ID" <<'PY'
from pathlib import Path
import re
import sys

project_file = Path(sys.argv[1])
app_url = sys.argv[2]
bundle_id = sys.argv[3]
text = project_file.read_text()

text = re.sub(r'PRODUCT_BUNDLE_IDENTIFIER = [^;]+;', f'PRODUCT_BUNDLE_IDENTIFIER = {bundle_id};', text)
text = re.sub(r'INTERNAL_APP_URL = "[^"]+";', f'INTERNAL_APP_URL = "{app_url}";', text)

project_file.write_text(text)
PY

echo "Configured iOS project:"
echo "  APP_URL=$APP_URL"
echo "  BUNDLE_ID=$BUNDLE_ID"
