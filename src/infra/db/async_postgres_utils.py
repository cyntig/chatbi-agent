#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/17.
"""

import asyncio
import re
from typing import Optional
from infra.logger import Logger
import os
from dotenv import load_dotenv
import asyncpg
from decimal import Decimal
from datetime import datetime, date

load_dotenv()

class AsyncPostgresUtils:
    """Async PostgreSQL utilities."""

    def __init__(self,
                 host=os.environ['POSTGRES_HOST'],
                 port=os.environ['POSTGRES_PORT'],
                 db=os.environ['POSTGRES_DATABASE'],
                 user=os.environ['POSTGRES_USER'],
                 password=os.environ['POSTGRES_PWD']) -> None:
        self.logger = Logger()
        self._host = host
        self._port = port
        self._db = db
        self._user = user
        self._password = password
        self._pool: Optional[asyncpg.Pool] = None

    async def _connect(self) -> None:
        """Create a connection to the database."""
        self._pool = await asyncpg.create_pool(user=self._user, 
                                        password=self._password, 
                                        database=self._db, 
                                        host=self._host,
                                        port=self._port)

    async def _close(self) -> None:
        """Close the database connection."""
        if self._pool is not None:
            await self._pool.close()
    
    
    async def execute_sql(self,
                           query: str) -> list:
        """Execute a query and return the results."""
        try:
            if self._pool is None:
                await self._connect()
            async with self._pool.acquire() as conn:
                rows = await conn.fetch(query)
                result = []
                for row in rows:
                    line = {}
                    for k, v in row.items():
                        if isinstance(v, Decimal):
                            line[k] = float(v)
                        elif isinstance(v, datetime):
                            line[k] = str(v)
                        elif isinstance(v, date): 
                            line[k] = str(v)
                        else:
                            line[k] = v
                    result.append(line)
            return result
        except Exception as e:
            err_msg = f"Query execution error: {e}."
            self.logger.normal_log.error(err_msg)
            raise e
        
        
    async def get_schema(self, tbl_schema, tbl_name):
        """Get the schema of a table."""
        if not self._pool:
            await self._connect()
        sql = f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{tbl_name}' AND table_schema = '{tbl_schema}';"
        return await self.execute_sql(sql)
    
    async def get_top_n(self, tbl_schema, tbl_name, column_name, n):
        sql = f"""
            SELECT "{column_name}", COUNT(*) AS cnt 
            FROM {tbl_schema}.{tbl_name}
            GROUP BY "{column_name}"
            ORDER BY cnt desc 
            limit {n}
        """
        raw_ret = await self.execute_sql(sql)
        finnal_ret = {}
        for item in raw_ret:
            finnal_ret[item[column_name]] = item['cnt']
        return finnal_ret

    async def get_max_and_min(self, tbl_schema, tbl_name, column_name): 
        sql = f"""
                    SELECT MAX("{column_name}") AS max, MIN("{column_name}") AS min
                    FROM {tbl_schema}.{tbl_name}
                """
        return (await self.execute_sql(sql))[0]


if __name__ == "__main__":
    util = AsyncPostgresUtils()
    # result = asyncio.run(util.execute_sql('SELECT "产品类别", SUM("总售价") AS 总销售额 FROM llm.tbl_super_store GROUP BY "产品类别" ORDER BY 总销售额 DESC'))
    # print(asyncio.run(util.get_schema('llm', 'tbl_super_store')))
    # print(result)
    print(asyncio.run(util.get_top_n('llm', 'tbl_super_store', '产品类别', 10)))