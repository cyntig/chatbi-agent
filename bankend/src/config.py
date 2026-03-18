#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/18.
"""

import yaml 

class Config: 
    def __init__(self, config_file):
        with open(config_file, 'r') as f:
            cfg = yaml.safe_load(f)

        self.logging = cfg['logging']
        self.llm_model = cfg['llm_model']


cfg = Config("config.yaml")

if __name__ == "__main__":
    print(cfg.logging)