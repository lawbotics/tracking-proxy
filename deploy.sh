#!/usr/bin/env bash

while getopts "e:n:t:" flag;
do
  case "${flag}" in
    e) ENVIRONMENT=${OPTARG};;
    n) FUNCTION_NAME=${OPTARG};;
    t) TARGET_PROXY_URL=${OPTARG};;
  esac
done

echo "Deploying function ${FUNCTION_NAME} with target url ${TARGET_PROXY_URL} and env ${ENVIRONMENT}"
gcloud functions deploy ${FUNCTION_NAME} \
  --entry-point proxy \
  --runtime nodejs16 \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --max-instances=1 \
  --set-env-vars TARGET_URL=${TARGET_PROXY_URL} \
  --set-env-vars ENVIRONMENT=${ENVIRONMENT}
