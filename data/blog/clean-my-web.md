---
title: Clean My Web (WIP)
date: '2023-01-04'
tags: ['ethereum', 'solidity', 'chrome extension', 'web development', 'crowdsourcing']
draft: false
summary: Chrome extension to interact with Ethereum smart contracts
images: []
---

# Clean My Web

[Github Link](https://github.com/AI-and-Blockchain/F22_Web_Spam_Cleanup)

This was a class project for AI and Blockchain during Fall 2022.

We developed a smart contract that can act as a data storage that stores a list of crowdsourced spam URLs. This smart contract was deployed and tested on Ethereum's Goerli network.

We also built a chrome extension that integrates with Metamask which can hide those reported urls on the smart contract.

The usage of Ethereum is not ideal in this project. We want this to be a data storage for ML models, but storing large amounts of data on the blockchain is not ideal, so for real life usage, it will need to make use of an alternative storage.

This project was also the inspiration for my [Algorand Mega Ace Hackathon project](/blog/mega-ace-hackathon)
