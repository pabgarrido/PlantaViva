"""Application Insights telemetry setup."""
from __future__ import annotations

import logging
import os


def setup_telemetry() -> None:
    """Configure Azure Application Insights via opencensus-ext-azure."""
    connection_string = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
    if not connection_string:
        logging.info("[parser-worker] APPLICATIONINSIGHTS_CONNECTION_STRING not set — skipping telemetry")
        return

    try:
        from opencensus.ext.azure.log_exporter import AzureLogHandler
        from opencensus.ext.azure.trace_exporter import AzureExporter
        from opencensus.trace.samplers import AlwaysOnSampler
        from opencensus.trace.tracer import Tracer

        logging.getLogger().addHandler(
            AzureLogHandler(connection_string=connection_string)
        )
        Tracer(
            exporter=AzureExporter(connection_string=connection_string),
            sampler=AlwaysOnSampler(),
        )
        logging.info("[parser-worker] Application Insights initialized")
    except ImportError:
        logging.warning("[parser-worker] opencensus-ext-azure not available — telemetry disabled")
