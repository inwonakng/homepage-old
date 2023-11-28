---
title: A tutorial on using open source LLMs
date: '2023-10-19'
tags: ['LLM', 'LLaMA2', 'transformers', 'peft', 'webui', 'open-source']
draft: false
summary: A tutorial on setting up your own instance of LLM and fine-tuning them.
images:
  [
    /static/images/open-source-llm-use-and-fine-tune/1-loading-model.png,
    /static/images/open-source-llm-use-and-fine-tune/2-enable-extension.png,
    /static/images/open-source-llm-use-and-fine-tune/3-train-lora.png,
    /static/images/open-source-llm-use-and-fine-tune/4-loading-lora.png,
  ]
---

**Update (Nov 11 2023)**

I noticed that the default API behaviors have changed as of Nov 11 2023.
OpenAI API will try to use the same port as the raw API, so it is advised to use only one.
In addition, I also found that oobabooga's OpenAI API also supports more options such as specifying templates, so it seems that the project will support the OpenAI API approach more.

## Table of contents:

- [How to get the weights](#how-to-get-the-weights)
- [Downloading & loading the model](#downloading--loading-the-model)
- [Enabling the API extension](#enabling-the-api-extension)
- [Using the API](#using-the-api)
- [Training & saving LoRA](#training--saving-lora)
- [Loading LoRA](#loading-lora)
- [Links](#links)

## How to get the weights

[TheBloke]() is a good source for accessing various fine-tuned/quantized versions for many open source models (as of 10/31/2023).
To get your hands on the original LLaMA 2 weights as released by Meta, you should sign up for official access through [this link](https://ai.meta.com/resources/models-and-libraries/llama-downloads/).
Getting this access will also allow you to access Meta research's [huggingface repos](https://huggingface.co/meta-llama) once you link your huggingface account.

## Downloading & Loading the model

### Using the WebUI

![](/static/images/open-source-llm-use-and-fine-tune/1-loading-model.png)

1. Go to the model tab.
2. Specify the model name (and/or branch) in the download section.
3. Reload the models list, select the newest model and load it.

- The loader is usually automatically detected by the dashboard. However, you may also manually switch to a different one.

### Using the terminal

You can clone the model weight repository by cloning the repository to under the `models/` directory of the WebUI repository's root folder.

```bash
git clone \
  --single-branch \ # you don't want to download every branch!
  --branch {BRANCH_NAME} \ # optional: only if you are not using the main branch
  {MODEL_REPO_URL} \ # url to repo
  models/{MODEL_NAME} # path to download repo to. This is the name that WebUI will refer to the model
```

Once the model is downloaded, you can start the server with the model pre-configured as well as the API extensions so that you do not have to manually configure using the browser.

```bash
python server.py \
  --model {MODEL_NAME} \ # name of model path excluding "models/"
  --api \ # turns on raw API
  --extensions openai # turns on OpenAI API
```

## Enabling the API extension

### Using the WebUI

![](/static/images/open-source-llm-use-and-fine-tune/2-enable-extension.png)

1. Go to session tab.
2. Select desired extensions (API, OpenAI APi, etc.).

## Using the API

WebUI offers two types of API styles.
The first one is their raw API, which has a more complicated structure but allows more paramters to be tweaked.
The other is the OpenAI style API, which follows the _known_ OpenAPI standards, which means that the client code can be easily switched out to OpenAI models.

### Raw API (likely deprecated)

The raw API is listening on port 5000 by default.
The `history` parameter can be a bit confusing.
There are two parts of the history parameter: `internal` and `visible`.
The `internal` history is the history that the model sees, while the `visible` history is the history that the user sees.

I have found that using the same history for both worked fine for my purposes.
Each history list is a list of tuples, where each tuple is a `[user_input, model_output]` pair.
Your final input is sent through the `user_input` paramter, and the system message can be set by `context_instruct`.

```python
import requests
from chat_api import DEFAULT_CHAT_PARAMS
import html

instruction = 'Your job is to play the assigned role and give responses to your best ability.\n'
chat_history = [
    [
        'You are a helpful assistant. You will answer questions I ask you. Reply with Yes if you understand.',
        'Yes, I understand'
    ]
]
params = dict(
    **DEFAULT_CHAT_PARAMS,
    user_input = 'What color is the sky?',
    history = dict(
        internal = chat_history,
        visible = chat_history,
    ),
    context_instruct = instruction,
)
response = requests.post('http://localhost:5000/api/v1/chat', json=params)
result = response.json()['results'][0]['history']
output = html.unescape(result['visible'][-1][1])
print(output)
```

### OpenAI style API

The OpenAI style API follows the known standards of OpenAI's standards.
One thing to note is to set dummy values for `OPENAI_API_KEY` and `OPENAI_API_BASE` environment variables.
More info on OpenAI API can be found [here](https://platform.openai.com/docs/introduction).

```python
conf = {
    # Name of the model, not useful for oobabooga
    'model': MODEL_NAME,
    # OpenAI key
    # or the default "sk-111111111111111111111111111111111111111111111111" for oobabooga
    'api_key': API_KEY

}
headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "Authorization": f"Bearer {conf['api_key']}"
}

data = {
    "messages": messages
}

if model in ['gpt-4', 'gpt-3.5-turbo']:
    data['model'] = model
else:
    data.update(CODELLAMA_ARGS)

response = requests.post(
    url = conf['url'],
    headers=headers,
    json=data,
    verify=False
)
if response.status_code == 200:
    model_output = response.json()['choices'][0]['message']['content']
else:
    raise Exception(f"Response returned with code {response.status_code}, message: {response.content.decode()}")
```

## Training & Saving LoRA

### Using the WebUI

![](/static/images/open-source-llm-use-and-fine-tune/3-train-lora.png)

1. Go to training tab.
2. Choose a LoRA to copy the weight shapes from.
3. Set dataset to train on (refer to the [tutorial link]() for formatting guide).

### Using transformers

Here is the full code I used to fine-tune the 4-bit 70B version of LLaMA2.
It can also be [found in the example repository](https://github.com/inwonakng/llm-usergroup-examples/blob/main/fine-tuning/huggingface.py), as well as the template files I used.

```python
'''
import dependencies
'''
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)

from peft import LoraConfig
from trl import SFTTrainer
from auto_gptq import exllama_set_max_input_length

from datasets import Dataset

import pandas as pd
import yaml
from sklearn.model_selection import train_test_split

'''
Load model
'''
model_name = "TheBloke/Llama-2-70B-chat-GPTQ"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    # device_map="auto",
    device_map={"": 0},
    trust_remote_code=False,
    revision="gptq-4bit-64g-actorder_True"
)
model = exllama_set_max_input_length(model, 8192) # Need to set when using LLaMa models
model.enable_input_require_grads() # Need to enable when training!

'''
Load dataset
'''
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right" # Fix weird overflow issue with fp16 training

print('successfully loaded model and tokenzier')

lora_config = LoraConfig(
    # target_modules=["q_proj", "k_proj"],
    init_lora_weights=False,
    lora_alpha=16,
    lora_dropout=0.1,
    r=64,
    bias="none",
    task_type="CAUSAL_LM",
)

training_arguments = TrainingArguments(
    output_dir='./train-output',
    num_train_epochs=5,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=1,
    optim='paged_adamw_32bit',
    save_steps=25,
    logging_steps=25,
    learning_rate=2e-4,
    weight_decay=1e-3,
    fp16=False,
    bf16=False,
    max_grad_norm=0.3,
    max_steps=-1,
    warmup_ratio=0.03,
    group_by_length=True,
    lr_scheduler_type='constant',
    report_to="tensorboard"
)

'''
Load and wrap the dataset to fine-tune on
'''

template = yaml.safe_load(open('./templates/college_confidential.yaml'))
df = pd.read_csv('./data/college_confidential/dataset.csv')

def wrap_task(alt_a, alt_b, text, label):
    prompt = '### System:\n'
    prompt += template['instruction']
    prompt += '\n\n'
    prompt += '### User:\n'
    prompt += template['task'].replace(
        '{alternative_a}', alt_a
    ).replace(
        '{alternative_b}', alt_b
    ).replace(
        'text', text
    )
    prompt += '\n\n'
    prompt += '### Response:\n'
    prompt += template['label'][label]
    return prompt

input_prompts = [
    wrap_task(alt_a, alt_b, text, label)
    for alt_a, alt_b, text, label in df[['alternative_a', 'alternative_b','text','label']].values
]

X_train, X_test, y_train, y_test = train_test_split(
    input_prompts,
    df['label'],
    test_size = .2,
    random_state = 0,
)

dataset = Dataset.from_dict(dict(
    text = X_train
))

json.dump(X_train, open('./data/college_confidential/train.json','w'))
json.dump(X_test, open('./data/college_confidential/test.json','w'))

print('loaded dataset')

trainer = SFTTrainer(
    model = model,
    train_dataset=dataset,
    peft_config=lora_config,
    dataset_text_field="text",
    max_seq_length=None,
    tokenizer=tokenizer,
    args=training_arguments,
    packing=False,
)

trainer.train()
trainer.model.save_pretrained('ft-college-confidential')
```

## Loading LoRA

### Using the WebUI

![](/static/images/open-source-llm-use-and-fine-tune/4-loading-lora.png)

Once your model is trained, you can load the LoRA model on top of your base model by selecting it from the `model` tab of the WebUI.
If your LoRA was not trained through the WebUI, make sure that the folder outputed by `.save_pretrained` method is placed under the `loras/` directory of the WebUI directory so it can be detected.

### Using terminal

You can use the `--lora` parameter to add the LoRA to the base model.
So an example command would look like the following:

```bash
python server.py \
  --model {MODEL_NAME} \
  --lora {LORA_NAME} \
  --api \
  --extensions openai
```

## Links:

- [TheBloke huggingface profile](https://huggingface.co/TheBloke)
- [OobaBooga WebUI repo](https://github.com/oobabooga/text-generation-webui)
- [Talk Video Link](https://tw.rpi.edu/media/foci-llm-users-group-guide-open-source-large-language-models-and-fine-tuning-techniques-18)
- [Slides](/static/pdf/10-18-LLM-User-Group.pdf)
- [Code Examples Repo](https://github.com/inwonakng/llm-usergroup-examples)
