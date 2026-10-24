#!/bin/sh
# Runs once, on first boot of an empty data volume. POSTGRES_DB has already been
# created by the image's own entrypoint; this adds the test database beside it.
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
	CREATE DATABASE "${TEST_DATABASE_NAME}" OWNER "${POSTGRES_USER}";
SQL
