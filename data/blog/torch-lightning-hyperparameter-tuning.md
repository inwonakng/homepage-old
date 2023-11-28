---
title: Hyperparameter tuning with Pytorch Lightning + Ray Tune
date: '2023-6-18'
tags: ['Deep Learing', 'Pytorch', 'PyTorch Lightning', 'Ray Tune']
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

## Why use it?

The reason I picked this framework up was the fact that I don't have to do any manual device management.
Before learning lightning, I used to create a file called `device.py` and to a top-level import for the deviced used in the experiments.
This means that every file that contains code dealing with backpropgation needed to import this file and call `.to(device)` in order to prevent cuda from complaining.
This worked well enough for simple cases, but can start to get pretty annoying once you start having to manage more complex tensor operations.

Other than that, it can provide a pretty clean way of managing your code.
One of the problems that I face every time I start a new project is how to structure it.
The best practice in the vanilla setting is to write a train and evaluate function that takes in the model and dataloaders, but this can result in unorganized code that is difficult to maintain. Lightning can take care of this problem by providing a boilerplate that can be followed, leaving much less room for possibly redundant deviations.

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

The problem of where to maintain the optimizer and criterion is another issue.
I've seen people (and I have done this in the past as well) writing code to match sklearn's API, by shoving everything inside the model and writing a `.fit` and `.predict` function.
But you either need to copy-paste tremendous amount of code or very carefully design a base class that can cover for all your cases if you start doing this for multiple of models.
The second case is what Lightning does.
Although it does not quite follow sklearn's API, the idea is similar.
There is a `LightningModule` that lives a layer above your `nn.Module` which takes care of the device management, optimizer, scheduler and logging.
You can follow the official docs for a [in-depth tutorial](https://lightning.ai/docs/pytorch/stable/model/train_model_basic.html), but below is the general idea.

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

So it really just looks like your regular `nn.Module` subclass.
That's because `pl.LightningModule` is a subclass of `nn.Module` and it inherits all the methods and attributes from it.
Easy enough!

## So what about logging?

A nice feature of Lightning is that it comes with built-in support for Tensorboard.
If you are not famiilar, Tensorbaord is a dashboard that you can use the track your models' updates in real time.
A quick and simple way to use it is the following:

```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter('./log')

for epoch in range(1000):
    # do something with model
    loss = criterion(out, y)
    ...

    writer.add_scalar('train/loss', loss, epoch)
```

This will create the directory specified in `SummaryWriter`'s constructor and populate it with log files with the values.
You should be able to access the dashboard in the link the command outputs by running `tensorboard --logdir ./log`.
It will look something like the following:

![tensorboard-main-page](/static/images/torch-lightning-hyperparameter-tuning/tensorboard.png)

## Basic hyperparameter tuning

This is useful enough when you just want to look at your loss curve or check various metric scores.
However, tensorboard can do much more.
On the top bar of the dashboard, there is a tab called 'HPARAMS'.
This is where you can compare the results of models with varying hyperparameters, allowing you to pick the best model.

Here are some screenshots of the cool things you can find on that page:

![](/static/images/torch-lightning-hyperparameter-tuning/hparams.png)

![](/static/images/torch-lightning-hyperparameter-tuning/scatter.png)

![](/static/images/torch-lightning-hyperparameter-tuning/coordinates.png)

These plots are showing the performance of different hyperparameters with respect to the metric beind used to evaluate them (in my case, validation loss).
Here is how you can achieve this in a few simple steps using the Lightning framework.

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

I omitted the unrelated parts to highlight just how simple it is.
All you need to do is the following:

1. Call `self.save_hyperparameters()` in the constructor of your Lightning module. This records the input to the constructor, so all your hyperparameters should be passed in as parameters in initialization.
2. Initialize the hyperparameter metrics as zero and specify which fields to follow.
3. When initializing the tensorboard logger, set `default_hp_metric` to `False`.

It's actually pretty well documented in the [official docs](https://lightning.ai/docs/pytorch/latest/extensions/logging.html#logging-hyperparameters). But by just following their instructions, I wasn't able to get the metrics to show up properly on the hparams dashboard. After a few hours of search, it seemed that turning off the `default_hp_metric` was the final piece -- at least in my case of custom hparam metrics. This took me some digging online to find, and I'm hoping that this will help you if you come across this post. I have also seen [posts online](https://github.com/Lightning-AI/lightning/issues/1225#issuecomment-605644904) noting that if some previous runs in the log directory did not have `hpmetric`, tensorboard struggles with finding the metrics, which might be helpful as well.

# Using Ray Tune

The method I described above is useful for a small-scale testing of hyperparameters. However, as your project's scale grows, the number of possible combinations of hyperparameters as well as managing parallel runs over multiple accelerator devices can become a headache. That's where [Ray Tune](https://docs.ray.io/en/latest/tune/index.html) comes into the play.

## What is Ray Tune?

Ray Tune is a framework that implements several state-of-the-art hyperparameter tuning algorithms. It also takes care of distributed training in a multi-device setting. It supports multiple types of ML frameworks, including pytorch, pytorch-lightning, jax and tensorflow. Since I'm working with pytorch lightning, I will just cover the lightning case in this post. At the time of writing, the stable version for Ray Tune is `2.5`. But the API's I am using are at their alpha stage, so some specifics may be different in the future.

## How much code do I have to modify?

Not much! The examples for Ray Tune might be a bit daunting, but that's because of the many settings you have to set. Ray Tune has a nice integration with pytorch lightning, so you do not have to change much in your `LightningModule` subclass. All you need to do is write anther script that imports your model.

One thing I found confusing when I got started with Ray Tune was that there were two versions of the tutorials. [This one](https://docs.ray.io/en/latest/tune/examples/tune-pytorch-lightning.html) makes use of `LightningConfigBuilder` and `LightningTrainer` from `ray.train.lightning`, while [this one](https://docs.ray.io/en/latest/tune/examples/tune-vanilla-pytorch-lightning.html) makes use of `TuneReportCallback` and `TuneReportCheckpointCallback` from `ray.tune.integration.pytorch_lightning`. As the url suggests, the second one is the _vanilla_ way of doing things, and the first link is the latest way to do things.

While the new way is nice, I did have a very minor complaint: the names of the parameters reported on the logs become enormous. For example, if the parameter would have been displayed as `in_dim` in the older method, now it will look something like `lightning_config/_module_init_config/in_dim`. It's really not a big deal, but it does make the output kind of difficult to read.

Anyways, below is a quick example of how I was able to get my LightningModule class to work with Ray Tune.
In this example, I am using the HyperOptSearch algorithm with the ASHA scheduler.

```python
from ray import air, tune
from ray.air.config import RunConfig, ScalingConfig, CheckpointConfig
from ray.tune.schedulers import ASHAScheduler, PopulationBasedTraining
from ray.tune.search.hyperopt import HyperOptSearch
from ray.train.lightning import LightningConfigBuilder, LightningTrainer

# prepare data module
dm = load_data_module(...)

# define how the lightning module will work
lightning_config = (
    LightningConfigBuilder()
    .module(
        cls=MyLightningModuleClass,
        dim_1 = tune.choice([10,20,30,40,50,60,70,80,90,100]),
        dim_2 = tune.choice([10,20,30,40,50,60,70,80,90,100]),

        default_param_1 = 'some string',
        default_param_2 = 10,
    )
    .trainer(
        max_epochs=num_epochs,
        accelerator=accelerator,
        logger = False,
        enable_progress_bar = False,
    )
    .fit_params(datamodule=dm)
    .checkpointing(monitor=my_target_metric, save_top_k=2, mode="max")
    .build()
)


run_config = RunConfig(
    checkpoint_config=CheckpointConfig(
        num_to_keep=2,
        checkpoint_score_attribute=my_target_metric,
        checkpoint_score_order="max",
    ),
)

# Notice that I'm not using a GPU.. can modify as needed
scaling_config = ScalingConfig(
    num_workers=1, use_gpu=False, resources_per_worker={"CPU": 1}
)

# Define a base LightningTrainer without hyper-parameters for Tuner
lightning_trainer = LightningTrainer(
    scaling_config=scaling_config,
    run_config=run_config,
)

scheduler = ASHAScheduler(max_t=num_epochs, grace_period=1, reduction_factor=2)
search_alg = HyperOptSearch(metric = f'val/{target_metric}', mode='max')
tuner = tune.Tuner(
    lightning_trainer,
    param_space={"lightning_config": lightning_config},
    tune_config=tune.TuneConfig(
        metric=my_target_metric,
        mode="max",
        num_samples=num_samples,
        scheduler=scheduler,
        search_alg=search_alg,
    ),
    run_config=air.RunConfig(
        name="tune_asha", # <- This sets the name for the run
    ),

)

results = tuner.fit()
best_result = results.get_best_result(metric=my_target_metric, mode="max")

print('=' * 80)
print('Best result')
print(best_result)
```

Few things to note:

- In the example shown in the official site, they use a dictionary called `config` to pass the parameters into your model as one object.
  I thought this was necessary and made some modifications to my code, but I really disliked this pattern as it produces unintuitive code.
  However, I found out that you <u>do not</u> need to follow this pattern.
  As I show in the example above, you can simple pass the different arguments to your constructor as keyword arguments.
  This way, if you have some default variables that do not need to be tested, you simply pass them in as is, and only pass the necessary variables as `tune.choice` or other [search space API](https://docs.ray.io/en/latest/tune/api/search_space.html).

- Notice that unlike the official tutorial, I am not using a logger for the lightning trainer.
  This is because Ray Tune is already logging the important stuff to its own directory, so there is no need to do this again.

- The metric used for checkpointing and tuning (`my_target_metric` in this case) must be logged in the module you are using.

- You might get a strange error claiming that your lightning module is not a subclass of `pl.LightningModule`.
  In my case, this was because the version of Ray I was using used `pytorch_lightning` instead of `lightning.pytorch`.
  If you see this error, check the source files for Ray to find out which lightning package it is using.

- In `scaling_config`, the `num_worker` corresponds to the number of workers **per trial**.
  Ray will always try to use all available resources, and will assign that number of workers per trial.
  In my experience, setting this value to a high number didn't necessarily lead to speedup -- in fact, unless your trials are very heavy, setting it to 1 will suffice.

- If you are using `LightningTrainer`, make sure that you implement the `DataModule` class in a way suggested by the official [pytorch lightning docs](https://lightning.ai/docs/pytorch/stable/data/datamodule.html) such that the `DataModule` object is not 'materialized' until `.setup` is called. If you don't do this, the ray logs will become enormous as it records every parameter to `trainer`.

I simplified the code, but this really is most of what you need to do to make Ray Tune work with your pytorch-lightning model.
Ray Tune stores its logs under `~/ray_results`.
You can take a look at the same hyperparameter page we saw earlier if you run tensorboard on this directory (i.e. `tensorboard --log_dir ~/ray_results`).
Unlike before, it is done algorithmically and you do not need to do anything related to hyperparameters on the torch lightining side (i.e. no need for save_hyperparameters anymore).

To load the best model, you need to first restore the tuner by giving it the path to the experiment (it would be `~/ray_results/tune_asha` if you followed the above example) and the type of trainer.
Then you can get the best results from it, which you can pass to the `load_from_checkpoint` function of `pl.LightningModule`.
I think there must be a nicer way to do this in a Ray-native way, but I wasn't able to find it and this was what I got working.
If there is a better way to do it without me digging into the result config, please leave it in the comments!

```python
tune.Tuner.restore(
    '~/ray_results/{EXPERIMENT_NAME}',
    LightningTrainer,
)

best_result = tuner.get_results().get_best_result()
model = MyLightningModule.load_from_checkpoint(
    best_result.path + '/model',
    **best_result.config['lightning_config']['_module_init_config']
)
```
