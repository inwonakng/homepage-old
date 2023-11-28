---
title: Critical Infrastructures of Northeastern US
date: '2022-04-23'
tags: ['react', 'redux', 'leaflet']
draft: false
summary: Built a map viewer website to display potential risks to critical infrastructures of Northeastern US
images: []
---

[Github Link](https://github.com/AI-and-Blockchain/F22_Web_Spam_Cleanup)
[Live Website](https://critical-infrastructures.github.io)

Class project for Xinformatics in Spring 2022.
I worked with a team to gather various geographic data on the northeastern region to create a regression model of possible landslide danger to the power infrastructures of Northeastern US.
I mostly worked on the web development part and built an interactive platform to view each infrastructures and also filter by danger level/state region.
This was my first introduction to redux in react, which I had a lot of fun with (and probably abused).
The leaflet library for rendering maps was pretty cool, and there's a lot more stuff that could be done with it.
We originally hosted the website on Vercel, but RPI network decided to stop working with vercel -- looks like its an ISP related issue so maybe not fixable in near future... -- so I had to migrate the website to github pages.
It still looks like it works well enough though.
The layout leaves more room for improvement, this was before I learned about using react bootstrap or nextjs.
