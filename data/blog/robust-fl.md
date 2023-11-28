---
title: Robust Federated Learning
date: '2023-04-25'
tags: ['federated learning', 'agglomerative clustering', 'pytorch', 'sklearn']
draft: false
summary: Built a framework for simluating federated learning in realistic scenarios
images: []
---

[Github Link](https://github.com/inwonakng/robust-fl)

This was a class project for Security and Privacy in Machine Learning in Spring 2023, taught by professor Lei Yu, done in a group wtih Daniel Della Vecchia.
This was a fun project, and my first dive into federated learning.
We focused on an aspect of federated learning known as 'straggling'.
This is when the client devices do not send their updates on time -- possibly adversarial, but also might be benign with the delays caused by hardware/network issues.
To mitigate this issue, we proposed a modified version of straggler weighting, where the delayed updates would still be incorporated to the global model but with some reduced weight, computed by how delayed they were and how many rounds have passed in the global epoch.
In this project, we propsosed some new aggregation methods -- custering using agglomerative clustering or by randomly picking model components.
We used simplified (only the first 2 labels) MNIST and CIFAR and implemented an MLP and CNN model for each of the datasets.
