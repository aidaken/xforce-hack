#!/usr/bin/env bash
set -euo pipefail

# Link this checkout to the team's hosted Supabase.
# Same project on main and every feature branch.
# https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr

REF="${SUPABASE_PROJECT_REF:-tfmzjvoqsktlzwnrzdzr}"
echo "Linking to Supabase project ref: ${REF}"
supabase link --project-ref "${REF}" --yes
echo "Done. Run: node scripts/check-supabase.mjs"
