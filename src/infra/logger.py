from pathlib import Path
import os
from typing import Literal
import jsonlines

import logging


class Logger:
    def __init__(self, log_file="defalut_log.jsonl"):
        self.log_dir = Path.cwd().parent / "logs"
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = log_file

        self.normal_log = self.__get_logger(
            name="normal", format="[ChatBI-MCP-Server][%(asctime)s] %(message)s"
        )
        self.stream_log = self.__get_logger(
            name="stream", format="%(message)s", stream=True
        )

    def __get_logger(
        self, name: str, format: str, level=logging.INFO, stream: bool = False
    ):
        log = logging.getLogger(name)
        log.propagate = False
        if not log.handlers:
            log.addHandler(self.__get_handler(format, stream))
        log.setLevel(level)
        return log

    def __get_handler(self, format: str, stream: bool = False):
        handler = logging.StreamHandler()
        if stream:
            handler.terminator = ""
        handler.setFormatter(logging.Formatter(format))
        return handler

    def save_jsonl(self, line: dict, mode: Literal["a", "w"] = "a"):
        file_path = self.log_dir / self.log_file
        with jsonlines.open(file_path, mode=mode) as writer:
            writer.write(line)


if __name__ == "__main__":
    # print(Path.cwd().parent / "logs")
    logger = Logger("text.jsonl")
    logger.save_jsonl({"test": "test"})
    logger.normal_log.info("normal_test")
    logger.normal_log.info("normal_test2")
    logger.stream_log.info("aaaa")
    logger.stream_log.info("bbbbccc")
