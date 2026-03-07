# -*- coding: UTF-8 -*-

import os 
from openai import OpenAI
from dotenv import load_dotenv
from openai.types.chat import ChatCompletion
from typing import Literal

load_dotenv()



class ChatOpenAI:
    def __init__(self, 
                 model: str,
                 base_url=os.environ['OPENAI_BASE_URL'],
                 api_key=os.environ['OPENAI_API_KEY']):
        self._model = model
        self.client = OpenAI(base_url=base_url, api_key=api_key)

    
    def chat_completions(self, 
                         messages: list, 
                         temperature=0.3,
                         **kwargs) -> ChatCompletion:
        try:
            response = self.client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=temperature,
                **kwargs
            )
            return response
        except Exception as e: 
            print(e)
            err_msg = f"OpenAI failed: {e}."
            raise Exception(err_msg)
    
    def get_choice(self, resp):
        return resp.choices[0]
    
    def get_tool_calls(self, resp):
        return self.get_message(resp).tool_calls
    
    def get_message(self, resp):
        return self.get_choice(resp).message
    
    def get_content(self, resp) -> str:
        return self.get_message(resp).content

    def get_finish_reason(self, resp):
        return resp.choices[0].finish_reason
