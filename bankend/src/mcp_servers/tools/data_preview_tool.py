# -*- coding: UTF-8 -*-
from infra.time_wrapper import timer_wrapper
from infra.db.async_postgres_utils import async_postgres_utils
from infra.logger import logger

from dotenv import load_dotenv
import os
import asyncio
import json

load_dotenv()


class DataPreviewTool: 
    def __init__(self):
        self.log = logger("standard")   
        self.log.info(f"DataPreviewTool initialized.")

    @timer_wrapper(enabled=bool(os.environ['TIME_WRAPPER_ENABLED']))
    async def data_preview(self, tbl_schema, tbl_name) -> list:
        schemas = await async_postgres_utils.get_schema(tbl_schema, tbl_name)
        
        for idx, value in enumerate(schemas):
            data_type = value['data_type']
            column_name = value['column_name']
            if data_type in ("character varying", "varchar", "character", "char", "text"):
                top_n = await async_postgres_utils.get_top_n(tbl_schema, tbl_name, column_name, 5)
                schemas[idx]['str_top5_value'] = top_n
            elif data_type in ("smallint", "integer", "bigint", 
                               "numeric", "decimal", "real", "double precision", 
                               "timestamp", "timestamp with time zone", "timestamp without time zone", "date"):
                max_and_min = await async_postgres_utils.get_max_and_min(tbl_schema, tbl_name, column_name)
                schemas[idx]['max_value'] = max_and_min['max']
                schemas[idx]['min_value'] = max_and_min['min']
        return schemas



if __name__ == "__main__":
    host = os.environ['POSTGRES_HOST']
    port = os.environ['POSTGRES_PORT']
    db = os.environ['POSTGRES_DATABASE']
    user = os.environ['POSTGRES_USER']
    password = os.environ['POSTGRES_PWD']
    pg_extractor = DataPreviewTool(host, port, db, user, password)


    preview = asyncio.run(pg_extractor.data_preview("llm", "tbl_super_store"))
    print(json.dumps(preview, ensure_ascii=False, indent=4))