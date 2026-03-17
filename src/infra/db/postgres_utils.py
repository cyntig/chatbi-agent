# -*- coding: UTF-8 -*-

import psycopg2
from decimal import Decimal
from datetime import datetime
from datetime import date

from dotenv import load_dotenv

load_dotenv()

import os 

class PostgresUtils: 
    def __init__(self,  
                 host=os.environ['POSTGRES_HOST'], 
                 port=os.environ['POSTGRES_PORT'], 
                 db=os.environ['POSTGRES_DATABASE'],
                 user=os.environ['POSTGRES_USER'], 
                 password=os.environ['POSTGRES_PWD']): 
        self.host = host
        self.port = port 
        self.database = db
        self.user = user 
        self.pwd = password

    def create_connection(self):
        try: 
            return psycopg2.connect(database=self.database, user=self.user, password=self.pwd)
        except Exception as e:
            err_msg = f"Database connection error: {e}."
            print(f"err_msg")
            raise Exception(err_msg)
    
    def execute_sql(self, sql_statement): 
        try: 
            conn = self.create_connection()
            with conn.cursor() as cur: 
                cur.execute(sql_statement)
                conn.commit()
                columns = [desc.name for desc in cur.description]
                exe_res = cur.fetchall()
                result = []

                for line in exe_res:
                    line = list(line)
                    for i, val in enumerate(line):
                        if isinstance(val, Decimal):
                            line[i] = float(val)
                        if isinstance(val, datetime):
                            line[i] = str(val)
                        if isinstance(val, date): 
                            line[i] = str(val)
                    result.append(dict(zip(columns, line)))
                return result
        except Exception as e: 
            conn.rollback()
            err_msg = f"Database execution error[{sql_statement}]: {e} "
            print(err_msg)
            raise Exception(err_msg)

    def close(self, conn): 
        if conn: 
            conn.close()
    
    def get_schema(self, tbl_schema, tbl_name):
        conn = self.create_connection()
        sql = f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{tbl_name}' AND table_schema = '{tbl_schema}';"
        return self.execute_sql(sql)
    

    def get_top_n(self, tbl_schema, tbl_name, column_name, n):
        sql = f"""
            SELECT "{column_name}", COUNT(*) AS cnt 
            FROM {tbl_schema}.{tbl_name}
            GROUP BY "{column_name}"
            ORDER BY cnt desc 
            limit {n}
        """
        raw_ret = self.execute_sql(sql)
        finnal_ret = {}
        for item in raw_ret:
            finnal_ret[item[column_name]] = item['cnt']
        return finnal_ret


    def get_max_and_min(self, tbl_schema, tbl_name, column_name): 
        sql = f"""
                    SELECT MAX("{column_name}") AS max, MIN("{column_name}") AS min
                    FROM {tbl_schema}.{tbl_name}
                """
        return self.execute_sql(sql)[0]


if __name__ == "__main__":
    pg_utils = PostgresUtils("localhost", "5432", "postgres", "monacui", "1234")
    conn = pg_utils.create_connection()
    print(pg_utils.execute_sql('SELECT "产品类别", SUM("总售价") AS 总销售额 FROM llm.tbl_super_store GROUP BY "产品类别" ORDER BY 总销售额 DESC'))
    pg_utils.close(conn)