import os 
from dotenv import load_dotenv
import asyncio

from openai.types.chat import ChatCompletionMessageParam

from infra.db.async_postgres_utils import async_postgres_utils
from infra.llm.chat_openai import ChatOpenAI
from infra.logger import logger
from infra.time_wrapper import timer_wrapper
import json
from config import cfg

load_dotenv()


class TextToSqlService:
    def __init__(self,
                 base_url=os.environ['OPENAI_BASE_URL'],
                 api_key=os.environ['OPENAI_API_KEY']):
        model: str = cfg.llm_model['mcp_model']
        self.chat_open_ai = ChatOpenAI(model, base_url=base_url, api_key=api_key)
        self.postgres_logger = logger("postgres")
        self.log = logger("standard")
        self.log.info(f"TextToSqlService initialized, use model={model}.")
        
    async def _generate_hits(self, tbl_schema, tbl_name):
        column_infos = await async_postgres_utils.get_schema(tbl_schema, tbl_name)
        columns_hits = [f"{column['column_name']}:{column['data_type']}" for column in column_infos]
        columns_hits_str = "\n".join(columns_hits)

        columns_value_hits = []
        for column_info in column_infos:
            column_name = column_info['column_name']
            data_type = column_info['data_type']
            if data_type not in ("character varying", "varchar", "character", "char", "text"):
                continue 
            else:
                top_n = await async_postgres_utils.get_top_n(tbl_schema, tbl_name, column_name, 5)
                values = ",".join(top_n.keys())
                column_value_hits = f"{column_name}: {values}"
                columns_value_hits.append(column_value_hits)
        
        columns_value_hits_str = "\n".join(columns_value_hits)

        return {'columns_hits_str': columns_hits_str, 'columns_value_hits_str': columns_value_hits_str}


    @timer_wrapper(enabled=bool(os.environ['TIME_WRAPPER_ENABLED']))
    async def _generate_sys_prompt(self, tbl_schema, tbl_name):
        hits = await self._generate_hits(tbl_schema, tbl_name)
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
   
    @timer_wrapper(enabled=bool(os.environ['TIME_WRAPPER_ENABLED']))
    async def generate_and_execute_sql_with_retry(self, tbl_schema, tbl_name, question, max_retry = -1):
        success = False 
        retry_n = 0
        sys_prompt = await self._generate_sys_prompt(tbl_schema, tbl_name) 
        user_prompt = f"""
            分析文本:{question}
            SQL代码:
        """
        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_prompt}
        ]
        while not success and (max_retry == -1 or retry_n < max_retry):
            assistant_msg = await self._text_to_sql(tbl_schema, tbl_name, question, messages)
            sql = assistant_msg.content
            exec_success, data = await self.execute_sql(sql)
            self.postgres_logger.info(json.dumps({
                "question": question,
                "retry_n": retry_n,
                "messages": messages,
                "data": data
            }, ensure_ascii=False))
            if exec_success:
                success = True
                return data
            else:
                content = f"请根据错误信息再修改sql语句，错误信息如下：{data}"
                messages.append(assistant_msg.model_dump())
                messages.append({
                    'role': 'user',
                    'content': content
                })
                retry_n += 1       

        if not success: 
            return data    
    
    
    @timer_wrapper(enabled=bool(os.environ['TIME_WRAPPER_ENABLED']))
    async def _text_to_sql(self, tbl_schema, tbl_name, question, messages):
        try:
            message = await self.chat_open_ai.async_chat(messages, temperature=0.3)
            return message
        except Exception as e: 
            err_msg = f"LLM execution failed[{messages}]: {e}."
            print(f"{err_msg}")
            raise Exception(err_msg)

    @timer_wrapper(enabled=bool(os.environ['TIME_WRAPPER_ENABLED']))
    async def execute_sql(self, sql):
        try:
            result = await async_postgres_utils.execute_sql(sql)
            return True, result
        except Exception as e:
            err_msg = str(e)
            return False, err_msg
        


if __name__ == "__main__":
    service = TextToSqlService()
    print(asyncio.run( service.generate_and_execute_sql_with_retry("llm", "tbl_super_store", "统计各产品类别的总销售额，按销售额降序排列")))