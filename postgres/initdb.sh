#!/bin/bash
set -e


psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE olibootstrap;
  CREATE DATABASE olibootstraptest;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "olibootstrap" <<-EOSQL
  CREATE EXTENSION pgcrypto;
  CREATE EXTENSION postgis;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "olibootstraptest" <<-EOSQL
  CREATE EXTENSION pgcrypto;
  CREATE EXTENSION postgis;
EOSQL

echo "Database and extension setup completed."
