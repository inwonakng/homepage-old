---
title: Crowdsourcing Perceptions of Gerrymandering
date: '2022-04-09'
tags: ['react', 'google sheets api', 'sklearn', 'crowdsourcing']
draft: false
summary: Built a website to conduct a survey on people's perception of Gerrymandering
images: []
---

[Survey Site (Responses are not recorded)](https://inwonakng.github.io/gerrymander-survey-site/)

[Map Design Tool](https://inwonakng.github.io/gerrymander-map-builder/)

We built a survey to collect responses from participants recruited through Amazon's Mechanical Turk to gather their perception of Gerrymandering given fictional maps.
I built a website that collected user responses and another website for designing maps to be used in the survey.
The response collection was done through google sheets API, which was an interesting experience.
We also analyzed the responses using simple ML models such as Logistic Regression and Decision Trees to find the correlation between the features of the maps and the user responses.
Looking back it's a bit clunky and the data storage could be handled better -- I just learned about redux and probably overused it.
But I am happy enough with it since the work was accepted.
