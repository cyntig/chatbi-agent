# -*- coding: UTF-8 -*-
import os
from dotenv import load_dotenv
from fastmcp import FastMCP
from fastmcp.exceptions import ToolError
from typing import Annotated 
from pydantic import Field
from typing import Literal
import pandas as pd
from pandas.api.types import (    
    is_numeric_dtype,
    is_string_dtype,
    is_datetime64_any_dtype
    )

from infra.logger import Logger

from openai import OpenAI

from infra.postgres_utils import PostgresUtils
from mcp_servers.tools.data_preview_tool import DataPreviewTool
from mcp_servers.tools.text_to_sql_service import TextToSqlService

load_dotenv()

logger = Logger()
server = FastMCP("chatbi-mcp-server")

@server.tool(name='data_preview')
def data_preview(tbl_schema: Annotated[str, "postgres表schema"],
                 tbl_name: Annotated[str, "postgres表名"]) -> list:
    """
    数据表预览，包括：
    1. 字段信息：字段名和字段类型
    2. 字段值：值枚举、值范围信息
    
    Args: 
    data_from: 支持excel和postgres两种数据源

    excel_path: data_from='excel'时生效, excel文件绝对路径

    tbl_schema: data_from='postgres'时生效, 表schema
    tbl_name: 

    Return: 
    A Json object with the following structure: 
    {
        'columns': [
            {
                'column_name': string, 
                'dtype': string,
                'str_top5_value': {
                    key: string,
                    value: long
                },
                'max_value': long
                'min_value': long
            }
        ]
    }

    Notes: 
    columns: 字段信息，包括字段名称和字段类型
    column_name:  字段名称
    dtype: 字段类型
    str_sampling_value: string类型top N
    max_value: 数值型、datatime类型最大值
    min_value: 数值型、datatime类型最小值
    """
    
    print(f"run data_preview: tbl_schema={tbl_schema}, tbl_name={tbl_name}" )

    host = os.environ['POSTGRES_HOST']
    port = os.environ['POSTGRES_PORT']
    db = os.environ['POSTGRES_DATABASE']
    user = os.environ['POSTGRES_USER']
    password = os.environ['POSTGRES_PWD']
    data_preview_tool = DataPreviewTool(host, port, db, user, password)
    return data_preview_tool.data_preview(tbl_schema, tbl_name)

@server.tool(name='generate_and_execute_sql')
def generate_and_execute_sql(tbl_schema: Annotated[str, "postgres表schema"],
                tbl_name: Annotated[str, "postgres表名"],
                question: Annotated[str, "自然语言描述的数据分析问题，非SQL语句"]): 
    """
    将用户的自然语言问题进行分析，返回结构化结果。
    """
    
    logger.log.info(f"calling tool generate_and_execute_sql: question={question}." )

    text_to_sql_service = TextToSqlService()
    data = text_to_sql_service.generate_and_execute_sql_with_retry(tbl_schema, tbl_name, question, 3)
    return data
        

if __name__ == "__main__":
    server.run(transport="http",  host="0.0.0.0", port=8000)



        

        


    

        


     

