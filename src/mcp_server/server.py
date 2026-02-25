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

import jsonlines

from openai import OpenAI

from db.postgres_utils import PostgresUtils
from tools.data_preview_tool import DataPreviewTool
from tools.text_to_sql_service import TextToSqlService

load_dotenv()

server = FastMCP("chatbi-mcp-server")

@server.tool(name='data_preview')
def data_preview(tbl_schema: Annotated[str, "postgres表schema"] = None,
                 tbl_name: Annotated[str, "postgres表名"] = None) -> list:
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

    host = os.environ['POSTGRES_HOST']
    port = os.environ['POSTGRES_PORT']
    db = os.environ['POSTGRES_DATABASE']
    user = os.environ['POSTGRES_USER']
    password = os.environ['POSTGRES_PWD']
    data_preview_tool = DataPreviewTool(host, port, db, user, password)
    return data_preview_tool.data_preview(tbl_schema, tbl_name)
    
def __generate_hits(pg_extractor, tbl_schema, tbl_name): 
    column_infos = pg_extractor.get_column_info(tbl_schema, tbl_name)
    columns_hits = [f"{column['column_name']}:{column['data_type']}" for column in column_infos]
    columns_hits_str = "\n".join(columns_hits)

    columns_value_hits = []
    for column_info in column_infos:
        column_name = column_info['column_name']
        data_type = column_info['data_type']
        if data_type not in ("character varying", "varchar", "character", "char", "text"):
            continue 
        else:
            top_n = pg_extractor.get_top_n(tbl_schema, tbl_name, column_name, 5)
            values = ",".join(top_n.keys())
            column_value_hits = f"{column_name}: {values}"
            columns_value_hits.append(column_value_hits)
    
    columns_value_hits_str = "\n".join(columns_value_hits)

    return {'columns_hits_str': columns_hits_str, 'columns_value_hits_str': columns_value_hits_str}


def __generate_sys_prompt(pg_extractor, tbl_schema, tbl_name): 
    hits = __generate_hits(pg_extractor, tbl_schema, tbl_name)
    columns_hits_str = hits['columns_hits_str']
    columns_value_hits_str = hits['columns_value_hits_str']

    sys_prompt = f"""
        你是一名BI数据分析师，我这有表信息和用户问题，严格按照Postgres语言规范生成SQL查询语句

        分析步骤：
        1. 通过数据预览初步理解表的定义和字段含义
        2. 请按照如下步骤理解和分析用户问题：
            - 如果用户问题和表不相关，请直接回答"不相关"
            - 如果用户问题和表内容相关，请严格按照PostgresSQL语法规范生成SQL查询语句

        输出要求：
        - 字段匹配：生成的SQL语句中，所有字段必须严格使用表结构信息中的中文字段名称
        - 特殊字段名：如果字段名包含特殊字符（如-、空格、中文等），请使用双引号括起来
        - 代码格式：只输出SQL代码，不要额外解释和添加注释，代码必须是合法的PostgresSQL代码
        - 单位转换：如果问题要求返回百分比，只需要返回分子与总数的原始比例（如0.25），不要在SQL中乘以100或者添加百分号

        表结构信息：
        - 数据库类型：PostgresSQL
        - 表名：{tbl_schema}.{tbl_name}
        - 字段列表：[字段名称:字段类型]\n {columns_hits_str}
        - 值真实性：WHERE语句中的筛选必须是表中真实存在的数据, 
            参考值如下：\n {columns_value_hits_str}
    """
    return sys_prompt

    
def __text_to_sql(pg_extractor, tbl_schema, tbl_name, question): 
    sys_prompt = __generate_sys_prompt(pg_extractor, tbl_schema, tbl_name)

    user_prompt = f"""
        分析文本:{question}
        SQL代码:
    """

    messages = [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
                ]

    try:
        client = OpenAI(base_url=os.environ['OPENAI_BASE_URL'], 
                    api_key=os.environ['OPENAI_API_KEY'])
        resp = client.chat.completions.create(
            model="Qwen/Qwen3-30B-A3B-Instruct-2507",
            messages=messages,
            temperature=0
        )
        sql = resp.choices[0].message.content.strip()
        return sql
    except Exception as e: 
        err_msg = f"LLM execution failed[{messages}]: {e}."
        print(f"{err_msg}")
        raise Exception(err_msg)


@server.tool(name='generate_and_execute_sql')
def generate_and_execute_sql(tbl_schema: Annotated[str, "postgres表schema"],
                tbl_name: Annotated[str, "postgres表名"],
                question: Annotated[str, "分析文本"]): 
    """
        将用户的自然语言问题转换为SQL语句，并在指定数据库中执行查询，返回结构化结果。
        适用于数据分析、统计查询、聚合计算等场景
    """

    text_to_sql_service = TextToSqlService()
    sql = text_to_sql_service.text_to_sql(tbl_schema, tbl_name, question)
    data = text_to_sql_service.execute_sql(sql)

    with jsonlines.open("../logs/sql.txt", mode="a") as writer:
        writer.write({
            'text': question,
            'sql': sql
        })
    return data
        

if __name__ == "__main__":
    server.run(transport="http",  host="0.0.0.0", port=8000)



        

        


    

        


     

