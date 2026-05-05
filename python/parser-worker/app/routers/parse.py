"""Parse router — receives parse requests from core-api."""
from __future__ import annotations

import os
import tempfile
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from azure.storage.blob import BlobServiceClient

logger = logging.getLogger(__name__)

router = APIRouter(tags=["parse"])


class ParseRequest(BaseModel):
    projectId: str
    blobName: str
    fileType: str
    storageConnectionString: str


@router.post("/parse")
async def parse_file(req: ParseRequest) -> dict:
    """Download file from blob storage, parse it, return SceneGraph."""
    logger.info(f"Parse request: project={req.projectId} file={req.blobName} type={req.fileType}")

    # Download from blob storage
    try:
        blob_client = BlobServiceClient.from_connection_string(req.storageConnectionString)
        container_client = blob_client.get_container_client("uploads")
        blob = container_client.get_blob_client(req.blobName)

        with tempfile.NamedTemporaryFile(suffix=f".{req.fileType}", delete=False) as tmp:
            download_stream = blob.download_blob()
            tmp.write(download_stream.readall())
            tmp_path = tmp.name
            logger.info(f"Downloaded blob to {tmp_path} ({os.path.getsize(tmp_path)} bytes)")
    except Exception as e:
        logger.error(f"Failed to download blob: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download file: {e}")

    # Parse based on file type
    try:
        if req.fileType == "dxf":
            from app.parsers.dxf_parser import parse_dxf
            scene = parse_dxf(tmp_path)
        elif req.fileType == "ifc":
            from app.parsers.ifc_parser import parse_ifc
            scene = parse_ifc(tmp_path)
        else:
            # For unsupported types, return a basic scene from file metadata
            scene = _fallback_scene(req.fileType, tmp_path)

        logger.info(
            f"Parsed: {len(scene.get('rooms', []))} rooms, "
            f"{len(scene.get('walls', []))} walls, "
            f"{len(scene.get('openings', []))} openings, "
            f"confidence={scene.get('metadata', {}).get('confidence', 0)}"
        )
        return scene
    except Exception as e:
        logger.error(f"Parse failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Parse failed: {e}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def _fallback_scene(file_type: str, file_path: str) -> dict:
    """Fallback for unsupported file types — returns minimal scene."""
    import uuid
    return {
        "schemaVersion": "1.0",
        "units": "meters",
        "rooms": [{
            "id": str(uuid.uuid4()),
            "name": "Planta (não processada)",
            "polygon": [[0, 0], [10, 0], [10, 8], [0, 8]],
            "ceilingHeight": 2.7,
        }],
        "walls": [
            {"id": str(uuid.uuid4()), "from": [0, 0], "to": [10, 0], "thickness": 0.15, "height": 2.7, "openings": []},
            {"id": str(uuid.uuid4()), "from": [10, 0], "to": [10, 8], "thickness": 0.15, "height": 2.7, "openings": []},
            {"id": str(uuid.uuid4()), "from": [10, 8], "to": [0, 8], "thickness": 0.15, "height": 2.7, "openings": []},
            {"id": str(uuid.uuid4()), "from": [0, 8], "to": [0, 0], "thickness": 0.15, "height": 2.7, "openings": []},
        ],
        "openings": [],
        "metadata": {
            "parsedFrom": file_type,
            "confidence": 0.3,
            "needsReview": True,
        },
    }
