#!/bin/bash

echo "Esperando a que LocalStack esté completamente inicializado..."
sleep 10

wait_for_service() {
  local service=$1
  echo "Esperando por el servicio: $service"
  
  until curl -s "http://localhost:4566/_localstack/health" | grep "\"$service\": \"available\"" > /dev/null; do
    echo "Servicio $service no disponible aún, esperando..."
    sleep 5
  done
  echo "Servicio $service está disponible"
}

wait_for_service "sqs"
wait_for_service "s3"

echo "Creando cola SQS: ${SQS_QUEUE_NAME:-property-import-queue}"
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name ${SQS_QUEUE_NAME:-property-import-queue} \
  --region ${AWS_REGION:-us-east-1} \
  --attributes DelaySeconds=0,MessageRetentionPeriod=86400,VisibilityTimeout=30

echo "Creando bucket S3: ${AWS_S3_BUCKET:-real-estate-assets}"
aws --endpoint-url=http://localhost:4566 s3api create-bucket \
  --bucket ${AWS_S3_BUCKET:-real-estate-assets} \
  --region ${AWS_REGION:-us-east-1}

echo 'Configurando política de bucket S3...'
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${AWS_S3_BUCKET:-real-estate-assets}/*"
    }
  ]
}
EOF

aws --endpoint-url=http://localhost:4566 s3api put-bucket-policy \
  --bucket ${AWS_S3_BUCKET:-real-estate-assets} \
  --policy file:///tmp/bucket-policy.json

echo "LocalStack inicializado correctamente"
echo "SQS Queue: ${SQS_QUEUE_NAME:-property-import-queue}"
echo "S3 Bucket: ${AWS_S3_BUCKET:-real-estate-assets}"