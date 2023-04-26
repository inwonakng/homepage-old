---
title: Analyzing and Predicting Success in Music
date: '2022-12-17'
tags: ['Explainable AI', 'Data Analysis', 'XGBoost', 'Network Science']
draft: false
summary: Inwon Kang, Michael Manduluk, Boleslaw Szymanski. (Scientific Reports)
---

Paper Link: [https://www.nature.com/articles/s41598-022-25430-9](https://www.nature.com/articles/s41598-022-25430-9)

This paper started as a class project for Frontiers of Network Science in Fall 2021. I worked with professor Bolek Szymanski and Michael Manduluk to collect a dataset of musicians and their collaboration history with each other to construct a collaboration graph. Using this graph, we analyzed the different features of each musicians -- their appearance on other musicians work, how many unique collaborators they have, how long the career was, etc -- to build a predictor for their success. We used the popularity score from Spotify API and appearing on Bilboard's Top 100 as a success metric. We made use of a single-tree XGBoost model with a constrained size to build a human-readable classifier that can be interpreted by anyone to understand the characteristics of successful musicians.
