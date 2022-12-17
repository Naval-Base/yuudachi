#!/bin/sh

set -eu -o pipefail

influx setup --skip-verify --bucket $INFLUXDB_INIT_BUCKET --retention $INFLUXDB_INIT_RETENTION --token $INFLUXDB_INIT_ADMIN_TOKEN --org $INFLUXDB_INIT_ORG --username $INFLUXDB_INIT_USERNAME --password $INFLUXDB_INIT_PASSWORD --host http://$INFLUXDB_INIT_HOST:8086 --force
