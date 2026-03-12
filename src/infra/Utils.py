#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/09.
"""

import json 

def parser_to_json(value: str):
    try:
        result = json.loads(value)
        return result
    except json.JSONDecodeError:
        return value
     