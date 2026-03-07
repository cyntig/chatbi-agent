from pathlib import Path
import os
from typing import Literal
import jsonlines

import logging


class Logger:
    def __init__(self, log_file = "defalut_log.jsonl"):
        self.log_dir = Path.cwd().parent / "logs" 
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = log_file
        
        self.log = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO, 
                            format="[ChatBI-MCP-Server][%(asctime)s] %(message)s")
        
    def save_jsonl(self, line: dict, mode: Literal['a', 'w'] = 'a'):
        file_path = self.log_dir / self.log_file
        with jsonlines.open(file_path, mode=mode) as writer:
            writer.write(line)
        
        
        


if __name__ == "__main__":
    print(Path.cwd().parent / "logs")
    logger = Logger('text.jsonl')
    logger.save_jsonl({"test": "test"})
    logger.log.info("calling tool")
        