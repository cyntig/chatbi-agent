#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/18.
"""
from typing import Literal

import logging
import logging.config
from logging import Logger
import sys
import os 

_LOGGING_CONFIG = {
    "version": 1,
    # 禁用未在config中生命的logger配置
    "disable_existing_loggers": False,  

    "formatters": {
        "standard": {
            "format": "[%(asctime)s][%(levelname)s][%(funcName)s] %(message)s"
        },
        "stream": {
            "format":  "%(message)s"
        }
    },

    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "standard",
            "stream": "ext://sys.stdout"
        },
        "console_stream": {
            "class": "logging.StreamHandler",
            "level": "DEBUG",
            "formatter": "stream",
            "stream": "ext://sys.stdout"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "standard",
            "filename": "../logs/app.log",
            "maxBytes": 10485760,
            "backupCount": 5,
            "encoding": "utf-8"
        },
        "postgres_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "standard",
            "filename": "../logs/postgres.log",
            "maxBytes": 10485760,
            "backupCount": 5,
            "encoding": "utf-8"
        }
    },

    "loggers": {
        "standard": {
            "level": "DEBUG",
            "handlers": ["console", "file"],
            "propagate": False
        },
        "stream": {
            "level": "DEBUG",
            "handlers": ["console_stream"],
            "propagate": False
        },
        "postgres": {
            "level": "DEBUG",
            "handlers": ["postgres_file"],
            "propagate": False
        }
    }
}

logging.config.dictConfig(_LOGGING_CONFIG)

def logger(name:Literal["standard", "stream", "postgres"]) -> Logger:
    log: Logger = logging.getLogger(name)
    if  name == "standard":
        for handler in log.handlers:
            # terminator 是 StreamHandler 特有的属性
            if isinstance(handler, logging.StreamHandler):
                    handler.terminator = "\n"
    return log



if __name__ == "__main__":
    stream = logger("stream")
    stream.info("Hello ")
    stream.info("World!")
    normal = logger("standard")
    normal.info("Hello World!")

    postgres = logger("postgres")
    postgres.info("Hello postgres!")
