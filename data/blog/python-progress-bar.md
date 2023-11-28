---
title: Progress Bars in Python
date: '2023-08-06'
tags: ['python', 'tqdm', 'rich']
draft: false
summary: Different options for making a nice progress bar in python scripts.
images:
  [
    /static/images/python-progress-bar/tqdm-terminal.png,
    /static/images/python-progress-bar/tqdm-jupyter.png,
    /static/images/python-progress-bar/rich-terminal.png,
    /static/images/python-progress-bar/rich-jupyter.png,
  ]
---

Progress bars are a nice way to track progress of your python script.
Usually, just printing the status of your script over some intervals is enough.
But you might find the flooding print statements a bit overwhelming once your script involves a large number of iterations/needs to run concurrently.
Luckily, there are a few packages on python that can create nice progress bars in just a few extra lines (or even characters).
In this post, we will cover `tqdm` and `rich`.

## tqdm

[`tqdm`](https://github.com/tqdm/tqdm) is a package that provides a simple interface to create and update progress bars.
If you have used torchvision's data utilities or huggingface's python API, you might already be familiar with this one.

Using tqdm is very simple. If you are executing a task over some iterable, you can simple wrap the iterable with `tqdm()` to make a progress bar.

Here is an example:

```python
import time
from tqdm.auto import tqdm
def do_something():
    time.sleep(1)

for i in tqdm(range(10), desc='doing something...'):
    do_something()
```

Note that we are importing from `tqdm.auto`, instead of just `tqdm`.
The `tqdm.auto` module returns a tqdm function that matches the environment automatically, so you don't have to worry about whether your code is being ran on a jupyter instance or the terminal.
Below is what the output looks like on my terminal and vscode jupyter notebook.

![](/static/images/python-progress-bar/tqdm-terminal.png)

![](/static/images/python-progress-bar/tqdm-jupyter.png)

If your task is more complicated and you want to manually update the progress bar, you can also do something like the following using `tqdm`.

```python
import time
from tqdm.auto import tqdm
def do_something():
    time.sleep(1)

progress= tqdm(total=10)

is_done = False
counter = 0
while not is_done:
    do_something()
    counter += 1
    progress.update()
    if couter == 9: break
```

It should also be noted that if you are iterating over a generator object, tqdm **will not** have a nice progress bar, and only show the iteration count.
This is because the object is not unpacked yet, and tqdm doesn't know how many to expect. In that case, you also need to provide the `total` parameter even if you are placing the gerenator obejct inside `tqdm`.

This is nice, but a possible problem is if you have other terminal outputs.
For example, you may occasionally want to print the metrics of the model you are testing.
If you print in the middle of a progress bar, `tqdm` will re-start at the end of the print output, which can result in some nasty looking stuff.

For example the following code will end up with two progress bars on the terminal:

```python
import time
from tqdm.auto import tqdm
def do_something():
    time.sleep(1)

for i in tqdm(range(10), desc='doing something...'):
    if i == 5: print('we are at 5')
    do_something()
```

![](/static/images/python-progress-bar/tqdm-print.png)

## rich

[`rich`](https://github.com/Textualize/rich) is another package that can be used to display progress bars. If you have used `pip` in recent versions of python, you have already seen it in action.
Getting started with rich is also pretty simple.
Below is a quick example:

```python
import time
from rich.progress import track
def do_something():
    time.sleep(1)

for i in track(range(10), description='doing something...'):
    do_something()
```

Here is what the outputs look like in the terminal and jupyter:

![](/static/images/python-progress-bar/rich-terminal.png)

![](/static/images/python-progress-bar/rich-jupyter.png)

Using rich, we can use print statements inside the tracked loop and the progress bar will not break.
But if you try to nest your `track` calls, you will face an error that says `LiveError: Only one live display may be active at once`, unlike tqdm.
This is because rich uses a differen method to render their progress bars, which does not allow multiple render sessions to display at the same time.

You can handle this by using the `Progress` class.

```python
import time
from rich.progress import Progress

def do_something():
    time.sleep(1)

with Progress() as progress:
    task1 = progress.add_task(description='[green]Task 1...', total = 10)

    for i in range(10):
        task2 = progress.add_task(description='[red]Task 2...', total = 10)
        for j in range(10):
            do_something()
            progress.update(task2, advance=1)
        progress.update(task1, advance=1)
        progress.remove_task(task2)
```

![](/static/images/python-progress-bar/rich-multi.png)

With `Progress`, we can dynamically create and remove tasks from the rendering session, keeping the progress bar always at the bottom of the screen.
Note that unlike tqdm, you always have to specify the update amount in the `.update` calls.

This allows us to keep the progress bars clean even in multiprocessing scenarios.
Simply pass the `progress` object as one of the parameters to the target funciton, and you can create, update and delete the task from inside of each function.

You can also customize the information displayed with the progress bar by playing with the column configuration, like the following:

```python
 with progress.Progress(
    '[progress.description]{task.description}',
    progress.BarColumn(),
    '[progress.percentage]{task.percentage:>3.0f}%',
    progress.TimeRemainingColumn(),
    progress.TimeElapsedColumn(),
    transient=True
) as progress:
    ...

```

Credits for this snippet: [https://www.deanmontgomery.com/2022/03/24/rich-progress-and-multiprocessing/](https://www.deanmontgomery.com/2022/03/24/rich-progress-and-multiprocessing/)
