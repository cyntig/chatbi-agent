# -*- coding: UTF-8 -*-

import os 
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class ChatOpenAI:
    def __init__(self, 
                 model: str,
                 base_url=os.environ['OPENAI_BASE_URL'],
                 api_key=os.environ['OPENAI_API_KEY']):
        self._model = model
        self.client = OpenAI(base_url=base_url, api_key=api_key)

    
    def chat(self, 
             prompts: list | str, 
             **kwargs):
        try:
            response = self.client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompts}] if isinstance(prompts, str) else prompts,
                **kwargs
            )
            return response.choices[0].message
        except Exception as e: 
            print(e)
            err_msg = f"OpenAI failed: {e}."
            raise Exception(err_msg)
    
    def stream_chat(self, 
                    prompts: list | str,
                    **kwargs):
        try:
            stream = self.client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompts}] if isinstance(prompts, str) else prompts,
                stream=True,
                **kwargs
            )
            for chunk in stream:
                if (len(chunk.choices) == 0 or chunk.choices[0].delta is None):
                    continue
                yield chunk.choices[0].delta
        except Exception as e:
            print(e)
            err_msg = f"OpenAI failed: {e}."
            raise Exception(err_msg)


if __name__ == "__main__":
    chat_open_ai = ChatOpenAI("moonshotai/Kimi-K2-Instruct-0905")
    # message = chat_open_ai.chat("你好呀")
    # print(message.model_dump())
    
    for delta in chat_open_ai.stream_chat("你好呀"):
        print(delta)