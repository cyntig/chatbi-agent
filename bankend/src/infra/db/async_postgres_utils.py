#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/17.
"""

import asyncio
import re
from typing import Optional
from infra.logger import logger
import os
from dotenv import load_dotenv
import asyncpg
from decimal import Decimal
from datetime import datetime, date

load_dotenv()

class AsyncPostgresUtils:
    """Async PostgreSQL utilities."""
    
    _lock = asyncio.Lock()  # 类级别的锁，确保连接池创建的线程安全

    def __init__(self,
                 host=os.environ['POSTGRES_HOST'],
                 port=os.environ['POSTGRES_PORT'],
                 db=os.environ['POSTGRES_DATABASE'],
                 user=os.environ['POSTGRES_USER'],
                 password=os.environ['POSTGRES_PWD']) -> None:
        self.logger = logger("standard")
        self._host = host
        self._port = port
        self._db = db
        self._user = user
        self._password = password
        self._pool: Optional[asyncpg.Pool] = None

    async def _connect(self) -> None:
        """Create a connection pool to the database with proper limits."""
        async with self._lock:
            # Double-check pattern：再次检查避免重复创建
            if self._pool is not None:
                return
            self._pool = await asyncpg.create_pool(
                user=self._user, 
                password=self._password, 
                database=self._db, 
                host=self._host,
                port=self._port,
                min_size=2,      # 最小连接数
                max_size=10,     # 最大连接数
                max_inactive_connection_lifetime=300  # 空闲连接 5 分钟后释放
            )

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
            assert self._pool is not None  # 类型检查断言
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
            self.logger.error(err_msg)
            raise e
        
        
    async def get_schema(self, tbl_schema, tbl_name):
        """Get the schema of a table."""
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


# 模块单例
async_postgres_utils = AsyncPostgresUtils()

if __name__ == "__main__":
    print(asyncio.run(async_postgres_utils.get_top_n('llm', 'tbl_super_store', '产品类别', 10)))