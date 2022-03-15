#!/usr/bin/env bash

while getopts n:t: flag
do
  case "${flag}" in
    n) FUNCTION_NAME=${OPTARG};;
    t) TARGET_PROXY_URL=${OPTARG};;
  esac
done

echo "Deploying function ${FUNCTION_NAME} with target url ${TARGET_PROXY_URL}"

gcloud functions deploy ${FUNCTION_NAME} \
  --entry-point proxy \
  --runtime nodejs16 \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --set-env-vars TARGET_URL=${TARGET_PROXY_URL}
