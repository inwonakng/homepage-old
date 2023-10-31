---
title: How to manage python dependencies with conda and venv
date: '2023-09-26'
tags: ['conda', 'venv', 'python']
draft: true
summary: A guide on using conda and venv to manage python virtual environments.
images: []
---

# Why do I need a virtual environment?

# Python venv

## What is venv?

`venv`, or [virtual environment](https://docs.python.org/3/library/venv.html), is python's built-in way of managing a virtual environment.
It creates an fresh (empty) python environment using the same version of python as the python instance you use to create the environment.
For example, if you use `python 3.10.12` to create the environment, your environment will also have version `3.10.12`.

## How do I use it?

You can create one by running `python -m venv {ENV_NAME}`.
Once you run this command, a directory named `{ENV_NAME}` will appear in the directory you run the command from.
To activate this environment, you can run `source {ENV_NAME}/bin/activate`.
This will cause your shell's instance to use the python executable inside `{ENV_NAME}/bin`.
Once you activate the environment, your shell should say `({ENV_NAME})` for every line.
If this does not work for some reason, you can also check your python executable by running `which python`.
If this returns `{ENV_NAME}/bin/python`, you are using the correct python version.

# What is conda?
