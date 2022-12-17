#!/bin/sh
docker-compose -f docker-compose.yml -f docker-compose.$1.yml ${@%$1}
