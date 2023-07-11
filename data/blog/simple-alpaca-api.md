---
title: Building a REST API for Alpaca
date: '2023-5-01'
tags: ['Natural Language Processing', 'Large Language Model', 'API', 'LLAMA', 'ALPACA', 'Pytorch']
draft: false
summary: Building a simple API using FastAPI to interact with Stanford NLP's Alpaca model
---

In this post, we will go over how to build a simple REST API that allows users to interact with Stanford's Alpaca model.

**disclaimer**: This is a simple modification of the gradio example provided by tloen on huggingface. All credits go to tloen and the researchers at Stanford for training and providing the Alpaca weights. I only wrote the code for the API server.

# Credits

- alpaca-lora interactive huggingface dashboard instance

  - [https://huggingface.co/spaces/tloen/alpaca-lora](https://huggingface.co/spaces/tloen/alpaca-lora)

- alpaca-lora github repo

  - [https://github.com/tloen/alpaca-lora](https://github.com/tloen/alpaca-lora)

- stanford-nlp alpaca github

  - [https://github.com/tatsu-lab/stanford_alpaca](https://github.com/tatsu-lab/stanford_alpaca)

- llama weights from decapoda research huggingface repo
  - [https://huggingface.co/decapoda-research/llama-7b-hf](https://huggingface.co/decapoda-research/llama-7b-hf)

# Building the API

## Setup

I used conda in my setup. I also recommend you do, unless you don't have a GPU on your system or want to save space that conda takes. Since this is a lora version of the model, a very lightweight cpu-only machine may be able to do fine, although I have not tested this.

To make the dev environment, simply follow the instructions in the [tloen repo's local setup guide](https://github.com/tloen/alpaca-lora#local-setup).

Then to install the FastAPI dependencies, run `pip install "fastapi[all]"` after activating the environment.

## Configuring the input

Given the existing gradio and evaluation code, changing it into a simple REST API is simple. We just need to locate the necessary paramaters that can be changed by the user inside [the gradio code](https://github.com/tloen/alpaca-lora/blob/main/generate.py).

In our case, there are two sets of parameters we need. The parameters to control the model's behavior, and the parameters provided by the user to invoke a response from the model.

```python
prompt = prompter.generate_prompt(instruction, input)
```

```python
generation_config = GenerationConfig(
    temperature=temperature,
    top_p=top_p,
    top_k=top_k,
    num_beams=num_beams,
)
```

To handle these two settings, we can build a simple model in pydantic to unpack the incoming request's body.

```python
class GenerationConfigModel(BaseModel):
    temperature: float
    top_p: float
    top_k: int
    num_beams = int

class PromptConfigModel(BaseModel):
    instruction: str
    input: str

class GenerationInputModel(BaseModel):
    generation_config: GenerationConfigModel
    prompt_config: PromptConfigModel
```

That's it!

Then we can re-use the rest of the generation code from [generate.py](https://github.com/tloen/alpaca-lora/blob/main/generate.py) in our POST endpoint.

## Full Code

The local dependency `utils.prompter` can be found [here](https://github.com/tloen/alpaca-lora/blob/main/utils/prompter.py).

As of writing this post, you need to specify the `transformer_version` field in `GenerationConfig` or there will be a `NotImplementedError` somewhere.

```python
from fastapi import FastAPI
from pydantic import BaseModel

import torch
import transformers
from peft import PeftModel
from transformers import GenerationConfig, LlamaForCausalLM, LlamaTokenizer
from utils.prompter import Prompter

# this part can be changed later
device = 'cuda'
base_model = 'decapoda-research/llama-7b-hf'
load_8bit = False
lora_weights = 'tloen/alpaca-lora-7b'

# setting up the model stuff
tokenizer = LlamaTokenizer.from_pretrained(base_model)
model = LlamaForCausalLM.from_pretrained(
    base_model,
    load_in_8bit=load_8bit,
    torch_dtype=torch.float16,
    device_map="auto",
)
model = PeftModel.from_pretrained(
    model,
    lora_weights,
    torch_dtype=torch.float16,
)
# unwind broken decapoda-research config
model.config.pad_token_id = tokenizer.pad_token_id = 0  # unk
model.config.bos_token_id = 1
model.config.eos_token_id = 2
prompter = Prompter()

# post request body handlers
class GenerationConfigModel(BaseModel):
    temperature: float
    top_p: float
    top_k: int
    num_beams = int

class PromptConfigModel(BaseModel):
    instruction: str
    input: str

class GenerationInputModel(BaseModel):
    generation_config: GenerationConfigModel
    prompt_config: PromptConfigModel


app = FastAPI()
@app.get('/')
async def check_alive():
    return "Alive"

@app.post("/generate")
async def generate(
    generation_input: GenerationInputModel
):
    prompt = prompter.generate_prompt(**generation_input.prompt_config.dict())
    generation_config = GenerationConfig(
        **generation_input.generation_config.dict(),
        transformers_version = '4.28.1',
    )

    inputs = tokenizer(prompt, return_tensors='pt')
    input_ids = inputs['input_ids'].to(device)

    generation_output = model.generate(
        input_ids=input_ids,
        generation_config=generation_config,
        return_dict_in_generate=True,
        output_scores=True,
        max_new_tokens=128,
    )
    s = generation_output.sequences[0]
    output = tokenizer.decode(s)
    clean_output = prompter.get_response(output)

    return {'output': clean_output}
```
