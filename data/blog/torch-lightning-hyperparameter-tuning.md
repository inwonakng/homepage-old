---
title: Hyperparameter tuning with Pytorch Lightning and Tensorboard
date: '2023-6-13'
tags: ['Deep Learing', 'Pytorch']
draft: false
summary: Quick tutorial on how to use tensorboard to do initial hyperparameter tuning with pytorch lightning.
images:
  [
    '/static/images/torch-lightning-hyperparameter-tuning/tensorboard.png',
    '/static/images/torch-lightning-hyperparameter-tuning/hparams.png',
    '/static/images/torch-lightning-hyperparameter-tuning/coordinates.png',
    '/static/images/torch-lightning-hyperparameter-tuning/scatter.png',
  ]
---

# What is Pytorch Lightning?

[Pytorch lightning](https://www.pytorchlightning.ai/index.html), or just Lightning, is a high-level framework that can be built on top of pytorch-based models. It takes care of device management, distributed device settings, logging and much more in an organized way.

# Why use it?

The reason that drove me to pick up this framework was the fact that I don't have to do any manual device management. Before learning lightning, I used to create a file called `device.py` and to a top-level import for the deviced used in the experiments. This means that every file that contains code dealing with backpropgation needed to import this file and call `.to(device)` in order to prevent cuda from complaining. This worked well enough for simple cases, but can start to get pretty annoying once you start having to manage more complex tensor operations.

Other than that, it also provides a pretty clean way of managing your code. One of the problems that I face every time I start a new project is how to structure. The best practice in the vanilla setting is to write a train and evaluate function that takes in the model and dataloaders, but this can result in unorganized code that is difficult to maintain. Lightning can take care of this problem by providing a boilerplate that can be followed, leaving much less room for possibly redundant deviations.

```python
'''
model.py
'''
import torch
from torch import nn

class Net(nn.Module):
    def __init__(self, *args, **kwargs):
        ...
    def forward(self, x: torch.FloatTensor):
        ...

'''
control.py
'''
from torch.utils.data import DataLoader

def train(model, train_loader:DataLoader):
    ...

def evaluate(model, val_loader:DataLoader):
    ...
```

The problem of where to maintain the optimizer and criterion is another issue. I've seen people (and I have done this in the past as well) writing code to match sklearn's API, by shoving everything inside the model and writing a `.fit` and `.predict` function. But if you were to do this for multiple models, you either need to copy-paste tremendous amount of code or very carefully design a base class that can cover for all your cases. The second case is what Lightning does. Although it does not quite follow sklearn's API, the idea is similar. There is a `LightningModule` that lives a layer above your `nn.Module` which takes care of the device management, optimizer, scheduler and logging. You can follow the official docs for a [in-depth tutorial](https://lightning.ai/docs/pytorch/stable/model/train_model_basic.html), but below is the general idea.

```python
import torch
from torch import nn
import lightning.pytorch as pl

class MyModel(pl.LightningModule):
    def __init__(self, in_dim:int, out_dim: int, hidden_dim: int, *args, **kwargs):
        self.model = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, out_dim),
        )

    def forward(self, x: torch.FloatTensor):
        return self.model(x)
    ...
```

So it really just looks like your regular `nn.Module` subclass. That's because `pl.LightningModule` is a subclass of `nn.Module` and it inherits all the methods and attributes from it. Easy enough!

# So what about logging?

A nice feature of Lightning is that it comes with built-in support for Tensorboard. If you are not famiilar, Tensorbaord is a dashboard that you can use the track your models' updates in real time. A quick and simple way to use it is the following:

```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter('./log')

for epoch in range(1000):
    # do something with model
    loss = criterion(out, y)
    ...

    writer.add_scalar('train/loss', loss, epoch)
```

This will create the directory specified in `SummaryWriter`'s constructor and populate it with log files with the values. And by running `tensorboard --logdir ./log`, you should be able to access the dashboard in the link the command outputs. It will look something like the following:

![tensorboard-main-page](/static/images/torch-lightning-hyperparameter-tuning/tensorboard.png)

This is useful enough when you just want to look at your loss curve or check various metric scores. However, tensorboard can do much more. On the top bar of the dashboard, there is a tab called 'HPARAMS'. This is where you can compare the results of models with varying hyperparameters, allowing you to pick the best model.

Here are some screenshots of the cool things you can find on that page:

![](/static/images/torch-lightning-hyperparameter-tuning/hparams.png)

![](/static/images/torch-lightning-hyperparameter-tuning/scatter.png)

![](/static/images/torch-lightning-hyperparameter-tuning/coordinates.png)

These plots are showing the performance of different hyperparameters with respect to the metric beind used to evaluate them (in my case, validation loss). Here is how you can achieve this in a few simple steps using the Lightning framework.

```python
'''
model.py
'''

import torch
from torch import nn
import lightning.pytorch as pl

class MyModel(pl.LightningModule):
    def __init__(self, in_dim:int, out_dim: int, hidden_dim: int, *args, **kwargs):
        self.model = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, out_dim),
        )
        self.save_hyperparameters()

    def forward(self, x: torch.FloatTensor):
        return self.model(x)

    def on_train_start(self):
        self.logger.log_params(self.hparams, {'val/loss': 0, 'test/loss': 0, ...})

    def validation_step(self, batch, batch_idx):
        # compute loss, and maybe some metrics
        ...
        self.log('val/loss', loss)

    def test_step(self, batch, batch_idx):
        # compute loss, and maybe some metrics
        ...
        self.log('test/loss', loss)

    ...

'''
main.py
'''

logger = pl.loggers.TensorBoardLogger(save_dir = './log', default_hp_metric = False)
...
trainer = pl.Trainer(
    logger = logger,
    ...
)
trainer.fit(
    model = model,
    ...
)

```

I omited the unrelated parts to higlight just how simple it is. All you need to do is the following:

1. Call `self.save_hyperparameters()` in the constructor of your Lightning module. This records the input to the constructor, so all your hyperparameters should be passed in as parameters in initialization.
2. Initialize the hyperparameter metrics as zero and specify which fields to follow.
3. When initializing the tensorboard logger, set `default_hp_metric` to `False`.

It's actually pretty well documented in the [official docs](https://lightning.ai/docs/pytorch/latest/extensions/logging.html#logging-hyperparameters). But by just following their instructions, I wasn't able to get the metrics to show up properly on the hparams dashboard. After a few hours of search, it seemed that turning off the `default_hp_metric` was the final piece -- at least in my case of custom hparam metrics. This took me some digging online to find, and I'm hoping that this will help you if you come across this post. I have also seen [posts online](https://github.com/Lightning-AI/lightning/issues/1225#issuecomment-605644904) noting that if some previous runs in the log directory did not have `hpmetric`, tensorboard struggles with finding the metrics, which might be helpful as well.
