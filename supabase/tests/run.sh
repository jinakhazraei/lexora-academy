#!/usr/bin/env bash
# Checks the database access rules against a throwaway local Postgres (14+).
#
#   createdb lexora_test        # any empty database you can drop afterwards
#   ./supabase/tests/run.sh lexora_test
#
# 00_supabase_stub.sql stands in for the parts of Supabase the migration needs
# (auth.users, auth.uid(), the anon/authenticated/service_role roles).
# Never run this against your real Supabase project.
set -euo pipefail
DB="${1:?Usage: run.sh <empty-database-name> [extra psql args]}"
shift || true
HERE="$(cd "$(dirname "$0")" && pwd)"
PSQL=(psql -X -q -v ON_ERROR_STOP=1 -d "$DB" "$@")

"${PSQL[@]}" -f "$HERE/00_supabase_stub.sql"
"${PSQL[@]}" -f "$HERE/../migrations/0001_student_accounts.sql"
"${PSQL[@]}" -f "$HERE/10_access_rules_test.sql"
