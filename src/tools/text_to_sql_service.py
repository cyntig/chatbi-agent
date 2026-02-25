import os 
from dotenv import load_dotenv

from openai import OpenAI

from db.postgres_utils import PostgresUtils
from tools.data_preview_tool import DataPreviewTool

load_dotenv()

class TextToSqlService:
    def __init__(self, 
                 host=os.environ['POSTGRES_HOST'], 
                 port=os.environ['POSTGRES_PORT'], 
                 db=os.environ['POSTGRES_DATABASE'],
                 user=os.environ['POSTGRES_USER'], 
                 password=os.environ['POSTGRES_PWD'], 
                 
                 base_url=os.environ['OPENAI_BASE_URL'],
                 api_key=os.environ['OPENAI_API_KEY']):
        self.pg_util = PostgresUtils(host, port, db, user, password)
        self.client = OpenAI(base_url=os.environ['OPENAI_BASE_URL'], 
                    api_key=os.environ['OPENAI_API_KEY'])
        
    def _generate_hits(self, tbl_schema, tbl_name):
        column_infos = self.pg_util.get_schema(tbl_schema, tbl_name)
        columns_hits = [f"{column['column_name']}:{column['data_type']}" for column in column_infos]
        columns_hits_str = "\n".join(columns_hits)

        columns_value_hits = []
        for column_info in column_infos:
            column_name = column_info['column_name']
            data_type = column_info['data_type']
            if data_type not in ("character varying", "varchar", "character", "char", "text"):
                continue 
            else:
                top_n = self.pg_util.get_top_n(tbl_schema, tbl_name, column_name, 5)
                values = ",".join(top_n.keys())
                column_value_hits = f"{column_name}: {values}"
                columns_value_hits.append(column_value_hits)
        
        columns_value_hits_str = "\n".join(columns_value_hits)

        return {'columns_hits_str': columns_hits_str, 'columns_value_hits_str': columns_value_hits_str}


    def _generate_sys_prompt(self, tbl_schema, tbl_name):
        hits = self._generate_hits(tbl_schema, tbl_name)
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




    def text_to_sql(self, tbl_schema, tbl_name, question):
        sys_prompt = self._generate_sys_prompt(tbl_schema, tbl_name) 
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

    def execute_sql(self, sql):
        return self.pg_util.execute_sql(sql)
