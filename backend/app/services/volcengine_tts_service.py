"""
Volcengine bidirectional TTS client for knowledge article read-aloud.
"""

from __future__ import annotations

import asyncio
import io
import json
import logging
import re
import struct
import uuid
from dataclasses import dataclass
from enum import IntEnum
from html import unescape
from typing import Any, Callable, List, Optional

import websockets

from ..core.config import Settings, settings


logger = logging.getLogger(__name__)


class TTSConfigurationError(RuntimeError):
    """Raised when the TTS provider is not configured."""


class TTSSynthesisError(RuntimeError):
    """Raised when the TTS provider cannot synthesize audio."""


class MsgType(IntEnum):
    Invalid = 0
    FullClientRequest = 0b1
    AudioOnlyClient = 0b10
    FullServerResponse = 0b1001
    AudioOnlyServer = 0b1011
    FrontEndResultServer = 0b1100
    Error = 0b1111


class MsgTypeFlagBits(IntEnum):
    NoSeq = 0
    PositiveSeq = 0b1
    LastNoSeq = 0b10
    NegativeSeq = 0b11
    WithEvent = 0b100


class VersionBits(IntEnum):
    Version1 = 1


class HeaderSizeBits(IntEnum):
    HeaderSize4 = 1


class SerializationBits(IntEnum):
    Raw = 0
    JSON = 0b1


class CompressionBits(IntEnum):
    None_ = 0


class EventType(IntEnum):
    None_ = 0
    StartConnection = 1
    FinishConnection = 2
    ConnectionStarted = 50
    ConnectionFailed = 51
    ConnectionFinished = 52
    StartSession = 100
    CancelSession = 101
    FinishSession = 102
    SessionStarted = 150
    SessionCanceled = 151
    SessionFinished = 152
    SessionFailed = 153
    UsageResponse = 154
    TaskRequest = 200
    TTSSentenceStart = 350
    TTSSentenceEnd = 351
    TTSResponse = 352
    TTSEnded = 359


@dataclass
class Message:
    """Minimal protocol message matching Volcengine's bidirectional TTS examples."""

    version: VersionBits = VersionBits.Version1
    header_size: HeaderSizeBits = HeaderSizeBits.HeaderSize4
    type: MsgType = MsgType.Invalid
    flag: MsgTypeFlagBits = MsgTypeFlagBits.NoSeq
    serialization: SerializationBits = SerializationBits.JSON
    compression: CompressionBits = CompressionBits.None_
    event: EventType | int = EventType.None_
    session_id: str = ""
    connect_id: str = ""
    sequence: int = 0
    error_code: int = 0
    payload: bytes = b""

    @classmethod
    def from_bytes(cls, data: bytes) -> "Message":
        if len(data) < 4:
            raise ValueError(f"Volcengine message too short: {len(data)} bytes")

        type_and_flag = data[1]
        message = cls(
            type=MsgType(type_and_flag >> 4),
            flag=MsgTypeFlagBits(type_and_flag & 0b00001111),
        )
        message.unmarshal(data)
        return message

    def marshal(self) -> bytes:
        buffer = io.BytesIO()
        header = [
            (self.version << 4) | self.header_size,
            (self.type << 4) | self.flag,
            (self.serialization << 4) | self.compression,
        ]

        header_size = 4 * self.header_size
        if padding := header_size - len(header):
            header.extend([0] * padding)

        buffer.write(bytes(header))
        for writer in self._get_writers():
            writer(buffer)

        return buffer.getvalue()

    def unmarshal(self, data: bytes) -> None:
        buffer = io.BytesIO(data)

        version_and_header_size = buffer.read(1)[0]
        self.version = VersionBits(version_and_header_size >> 4)
        self.header_size = HeaderSizeBits(version_and_header_size & 0b00001111)

        buffer.read(1)

        serialization_compression = buffer.read(1)[0]
        self.serialization = SerializationBits(serialization_compression >> 4)
        self.compression = CompressionBits(serialization_compression & 0b00001111)

        header_size = 4 * self.header_size
        if padding_size := header_size - 3:
            buffer.read(padding_size)

        for reader in self._get_readers():
            reader(buffer)

    def _get_writers(self) -> List[Callable[[io.BytesIO], None]]:
        writers: List[Callable[[io.BytesIO], None]] = []

        if self.flag == MsgTypeFlagBits.WithEvent:
            writers.extend([self._write_event, self._write_session_id])

        if self.type in (
            MsgType.FullClientRequest,
            MsgType.FullServerResponse,
            MsgType.FrontEndResultServer,
            MsgType.AudioOnlyClient,
            MsgType.AudioOnlyServer,
        ):
            if self.flag in (MsgTypeFlagBits.PositiveSeq, MsgTypeFlagBits.NegativeSeq):
                writers.append(self._write_sequence)
        elif self.type == MsgType.Error:
            writers.append(self._write_error_code)
        else:
            raise ValueError(f"Unsupported Volcengine message type: {self.type}")

        writers.append(self._write_payload)
        return writers

    def _get_readers(self) -> List[Callable[[io.BytesIO], None]]:
        readers: List[Callable[[io.BytesIO], None]] = []

        if self.type in (
            MsgType.FullClientRequest,
            MsgType.FullServerResponse,
            MsgType.FrontEndResultServer,
            MsgType.AudioOnlyClient,
            MsgType.AudioOnlyServer,
        ):
            if self.flag in (MsgTypeFlagBits.PositiveSeq, MsgTypeFlagBits.NegativeSeq):
                readers.append(self._read_sequence)
        elif self.type == MsgType.Error:
            readers.append(self._read_error_code)
        else:
            raise ValueError(f"Unsupported Volcengine message type: {self.type}")

        if self.flag == MsgTypeFlagBits.WithEvent:
            readers.extend([self._read_event, self._read_session_id, self._read_connect_id])

        readers.append(self._read_payload)
        return readers

    def _write_event(self, buffer: io.BytesIO) -> None:
        buffer.write(struct.pack(">i", int(self.event)))

    def _write_session_id(self, buffer: io.BytesIO) -> None:
        if self.event in (
            EventType.StartConnection,
            EventType.FinishConnection,
            EventType.ConnectionStarted,
            EventType.ConnectionFailed,
        ):
            return

        session_id_bytes = self.session_id.encode("utf-8")
        buffer.write(struct.pack(">I", len(session_id_bytes)))
        buffer.write(session_id_bytes)

    def _write_sequence(self, buffer: io.BytesIO) -> None:
        buffer.write(struct.pack(">i", self.sequence))

    def _write_error_code(self, buffer: io.BytesIO) -> None:
        buffer.write(struct.pack(">I", self.error_code))

    def _write_payload(self, buffer: io.BytesIO) -> None:
        buffer.write(struct.pack(">I", len(self.payload)))
        buffer.write(self.payload)

    def _read_event(self, buffer: io.BytesIO) -> None:
        event_bytes = buffer.read(4)
        if not event_bytes:
            return

        event_value = struct.unpack(">i", event_bytes)[0]
        try:
            self.event = EventType(event_value)
        except ValueError:
            self.event = event_value

    def _read_session_id(self, buffer: io.BytesIO) -> None:
        if self.event in (
            EventType.StartConnection,
            EventType.FinishConnection,
            EventType.ConnectionStarted,
            EventType.ConnectionFailed,
            EventType.ConnectionFinished,
        ):
            return

        size_bytes = buffer.read(4)
        if not size_bytes:
            return

        size = struct.unpack(">I", size_bytes)[0]
        if size:
            self.session_id = buffer.read(size).decode("utf-8")

    def _read_connect_id(self, buffer: io.BytesIO) -> None:
        if self.event not in (
            EventType.ConnectionStarted,
            EventType.ConnectionFailed,
            EventType.ConnectionFinished,
        ):
            return

        size_bytes = buffer.read(4)
        if not size_bytes:
            return

        size = struct.unpack(">I", size_bytes)[0]
        if size:
            self.connect_id = buffer.read(size).decode("utf-8")

    def _read_sequence(self, buffer: io.BytesIO) -> None:
        sequence_bytes = buffer.read(4)
        if sequence_bytes:
            self.sequence = struct.unpack(">i", sequence_bytes)[0]

    def _read_error_code(self, buffer: io.BytesIO) -> None:
        error_code_bytes = buffer.read(4)
        if error_code_bytes:
            self.error_code = struct.unpack(">I", error_code_bytes)[0]

    def _read_payload(self, buffer: io.BytesIO) -> None:
        size_bytes = buffer.read(4)
        if not size_bytes:
            return

        size = struct.unpack(">I", size_bytes)[0]
        if size:
            self.payload = buffer.read(size)


def normalize_tts_text(text: str, max_chars: Optional[int] = None) -> str:
    normalized = unescape(text or "").replace("\xa0", " ")
    normalized = re.sub(r"<[^>]+>", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    normalized = normalized.strip()

    if max_chars and len(normalized) > max_chars:
        return normalized[:max_chars]

    return normalized


class VolcengineTTSService:
    def __init__(self, app_settings: Settings = settings):
        self.settings = app_settings

    def build_start_session_payload(
        self,
        *,
        voice: Optional[str] = None,
        speed: Optional[int] = None,
    ) -> dict[str, Any]:
        speech_rate = self.settings.VOLCENGINE_TTS_SPEECH_RATE if speed is None else speed
        req_params = {
            "speaker": voice or self.settings.VOLCENGINE_TTS_SPEAKER,
            "audio_params": {
                "format": self.settings.VOLCENGINE_TTS_AUDIO_FORMAT,
                "sample_rate": self.settings.VOLCENGINE_TTS_SAMPLE_RATE,
                "bit_rate": self.settings.VOLCENGINE_TTS_BIT_RATE,
                "speech_rate": speech_rate,
                "loudness_rate": self.settings.VOLCENGINE_TTS_LOUDNESS_RATE,
            },
        }

        if self.settings.VOLCENGINE_TTS_MODEL:
            req_params["model"] = self.settings.VOLCENGINE_TTS_MODEL

        return {
            "req_params": req_params,
        }

    def build_task_request_payload(self, text: str) -> dict[str, Any]:
        return {
            "req_params": {
                "text": text,
            }
        }

    async def synthesize(
        self,
        text: str,
        *,
        title: Optional[str] = None,
        voice: Optional[str] = None,
        speed: Optional[int] = None,
    ) -> bytes:
        del title
        api_key = self.settings.VOLCENGINE_TTS_API_KEY
        if not api_key:
            raise TTSConfigurationError("Volcengine TTS API key is missing")

        normalized_text = normalize_tts_text(
            text,
            max_chars=self.settings.VOLCENGINE_TTS_MAX_CHARS,
        )
        if not normalized_text:
            raise TTSSynthesisError("朗读内容为空")

        session_id = str(uuid.uuid4())
        headers = {
            "X-Api-Key": api_key,
            "X-Api-Resource-Id": self.settings.VOLCENGINE_TTS_RESOURCE_ID,
            "X-Api-Connect-Id": str(uuid.uuid4()),
        }

        try:
            async with websockets.connect(
                self.settings.VOLCENGINE_TTS_ENDPOINT,
                additional_headers=headers,
                open_timeout=self.settings.VOLCENGINE_TTS_TIMEOUT_SECONDS,
                ping_interval=20,
                ping_timeout=20,
                max_size=None,
            ) as websocket:
                await self._send_event(websocket, EventType.StartConnection, {})
                await self._wait_for_event(websocket, EventType.ConnectionStarted)

                await self._send_event(
                    websocket,
                    EventType.StartSession,
                    self.build_start_session_payload(voice=voice, speed=speed),
                    session_id=session_id,
                )
                await self._wait_for_event(websocket, EventType.SessionStarted)

                await self._send_event(
                    websocket,
                    EventType.TaskRequest,
                    self.build_task_request_payload(normalized_text),
                    session_id=session_id,
                )
                await self._send_event(
                    websocket,
                    EventType.FinishSession,
                    {},
                    session_id=session_id,
                )

                audio_bytes = await self._collect_audio(websocket)
                await self._send_event(websocket, EventType.FinishConnection, {})
                return audio_bytes
        except TTSConfigurationError:
            raise
        except TTSSynthesisError:
            raise
        except Exception as exc:
            logger.exception("Volcengine TTS synthesis failed")
            raise TTSSynthesisError("火山引擎语音合成请求失败") from exc

    async def _send_event(
        self,
        websocket: Any,
        event: EventType,
        payload: dict[str, Any],
        *,
        session_id: str = "",
    ) -> None:
        message = Message(
            type=MsgType.FullClientRequest,
            flag=MsgTypeFlagBits.WithEvent,
            event=event,
            session_id=session_id,
            payload=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        )
        await websocket.send(message.marshal())

    async def _receive_message(self, websocket: Any) -> Message:
        data = await asyncio.wait_for(
            websocket.recv(),
            timeout=self.settings.VOLCENGINE_TTS_TIMEOUT_SECONDS,
        )
        if not isinstance(data, bytes):
            raise TTSSynthesisError("火山引擎返回了非二进制消息")

        return Message.from_bytes(data)

    async def _wait_for_event(self, websocket: Any, event: EventType) -> Message:
        while True:
            message = await self._receive_message(websocket)
            self._raise_for_failure(message)

            if message.event == event:
                return message

    async def _collect_audio(self, websocket: Any) -> bytes:
        audio_chunks: list[bytes] = []

        while True:
            message = await self._receive_message(websocket)
            self._raise_for_failure(message)

            if message.type == MsgType.AudioOnlyServer or message.event == EventType.TTSResponse:
                if message.payload:
                    audio_chunks.append(message.payload)

            if message.event in (EventType.SessionFinished, EventType.TTSEnded):
                break

        if not audio_chunks:
            raise TTSSynthesisError("火山引擎未返回音频数据")

        return b"".join(audio_chunks)

    def _raise_for_failure(self, message: Message) -> None:
        if message.type == MsgType.Error:
            detail = self._decode_payload(message.payload) or f"error_code={message.error_code}"
            raise TTSSynthesisError(f"火山引擎返回错误: {detail}")

        if message.event in (
            EventType.ConnectionFailed,
            EventType.SessionFailed,
            EventType.SessionCanceled,
        ):
            detail = self._decode_payload(message.payload)
            raise TTSSynthesisError(f"火山引擎语音任务失败: {detail}")

    def _decode_payload(self, payload: bytes) -> str:
        if not payload:
            return ""

        try:
            decoded = payload.decode("utf-8")
        except UnicodeDecodeError:
            return ""

        try:
            parsed = json.loads(decoded)
        except json.JSONDecodeError:
            return decoded

        if isinstance(parsed, dict):
            return str(parsed.get("message") or parsed.get("detail") or parsed)

        return decoded
