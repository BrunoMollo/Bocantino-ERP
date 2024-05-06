#!/bin/bash
#
# Motive of this script: dump the production database into a local .sql file
#
# How to use:
#   sh ./dump.sh <USERNAME> <HOST>
#
# Enter the database password when asked
#
# Note: host looks like '<something>.us-east-X.aws.neon.tech' for Neon
#
#

# Arguments
username="$1"
host="$2"

# Testing Admin User
# Note: hash based on env valriable JWT_SECRET_KEY="what are you looking for??"
hash="\$2b\$10\$YguhBGDoFkNz.OlWhm.3HOW3a1lkCFYMU.7kJcg629gy9EM.sLGdq"
test_user_sql="INSERT INTO public.app_user (id, username, password_hash) VALUES (1, 'admin', '$hash')"

# Output File Config
timestamp=$(date +"%Y%m%d_%H%M%S")
file_name="bocantino-$timestamp.sql"

# Comand
echo ">> Starting Dump"
pg_dump --inserts --column-inserts --username=$username \
	--host=$host \
	--port=5432 bocantino |
	sed "/INSERT INTO public.app_user/d" |
	sed "\$a$test_user_sql" |
	cat >"$file_name"
echo ">> Backup done: ./$file_name (hopefully)"
