// otel.js
'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// データ・アップロード・エンドポイントとプライベート・キーを設定
const PRIVATE_ENDPOINT = "xxxxxxxxxxxxxx/20200101/opentelemetry/public/v1/traces"; // データ・アップロード・エンドポイント
const PRIVATE_DATA_KEY = "xxxxxxxxxxxxxx"; //プライベート・キー名
const SERVICE_NAME = "WebBananaApp"; //任意の名前

const exporter = new OTLPTraceExporter({
  url: PRIVATE_ENDPOINT,
  headers: {
    "Authorization": `dataKey ${PRIVATE_DATA_KEY}`
  }
});

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: SERVICE_NAME
});

try {
  sdk.start();
  console.log("OpenTelemetry initialized for OCI APM");
} catch (err) {
  console.error("Error initializing OpenTelemetry", err);
}

const shutdown = () => {
  try {
    sdk.shutdown();
    console.log("OpenTelemetry shutdown");
  } catch (err) {
    console.error("Error shutting down OpenTelemetry", err);
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
