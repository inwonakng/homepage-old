---
title: Tips for using remote computing resources
date: '2023-7-08'
tags: ['ssh', 'remote-computing']
draft: false
summary: Some tips I learned over the years on using a remote computing resources effectively.
images: [/static/images/remote-computing-tips/vscode-remote-ssh.png]
---

# SSH

If you are using a remote computing resource, it's most likely that you are accessing it through ssh.
Below are some tips I found useful for using SSH.

## Using SSH keys

SSH keys can be used to access remote machines or repositories without typing in the password every time (In fact, github has phased out passwords at this point).
Github has a [good tutorial on this](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) as well.
To generate a key for your machine, you can run `ssh-keygen`.
You will be asked to choose a directory and a passphrase for the key.
Pressing enter will just use the default settings for everything.

The program will output your public key in its output once you finish the generation process.
To add it to your github account, you can go do you settings (in the main page, press your account's picture and press settings), and find the menu for SSH keys under the 'Access' section.
You can paste the value of your ssh key by creating a new item in that menu and give it a descriptive name for your machine.
You should now be able to use all the repositories that your account has access to on the new machine without having to do any more authentication.
If you need to check your public key later, you can use the `cat` command to display it in the terminal, e.g. `cat ~/.ssh/id_rsa.pub` (this is if you followed all the default settings in the keygen process).

Now that you have the key, you can also register it in your remote servers to access it without typing in the password every time.
You can do this with the `ssh-copy-id` command. Simply run `ssh-copy-id {USERNAME}@{HOSTNAME}` after replacing the username and hostname values, and your ssh key will be registered to that machine. No more password typing!

## Port fowarding on remote machines

Port forwarding is very useful if you are using your remote machine to run a heavy process and would like to access it from your local machine.
For example, you could be running a tensorboard instance from the remote machine and would like to view it on your local machine's browser.
The simplest way of forwarding port with ssh is by using the `-L` argument in your ssh command.

```bash
ssh -L {LOCAL_PORT_YOU_WANT}:{REMOTE_ADDRESS}:{REMOTE_PORT_TO_FORWARD} {REMOTE_NAME}
```

Or, if you are always using the same port and don't want to bother typing out the whole thing every time, you can modify your local machine's ssh setting to always forward a particular port by modifying the `~/.ssh/config` file.

```ssh-config:~/.ssh/config
Host {REMOTE_NAME}
    HostName {REMOTE_ADDRESS}
    LocalForward 127.0.0.1:{LOCAL_PORT_YOU_WANT} {REMOTE_ADDRESS}:{REMOTE_PORT_TO_FORWARD}
    User {YOUR_USERNAME}
```

Notice that you can give some nickname to the remote server instead of typing out the full address by modifying the `{SOME_UNIQUE_NAME}` field in the examples.

If your remote machine is behind a login node, the process is similar.
In this case, you first need to connect to your login node and then connect to the actual computing machine behind it, so you need to make two connections.

```ssh-config:~/.ssh/config
Host {LOGIN_NODE_NAME}
    HostName {LOGIN_NODE_ADDRESS}
    User {YOUR_USERNAME}

Host {COMPUTE_NODE_NAME}
    HostName {COMPUTE_NODE_ADDRESS}
    ProxyJump {LOGIN_NODE_NAME}
    LocalForward 127.0.0.1:{LOCAL_PORT_YOU_WANT} {COMPUTE_NODE_NAME}:{REMOTE_PORT_TO_FORWARD}
    User {YOUR_USERNAME}
```

The important thing here to note is the `ProxyJump` command. This tells ssh that we need to go through another machine, in this case specified by `{LOGIN_NODE_NAME}`, in order to connect to our target.
This allows you to directly connect to the target compute node by running `ssh {COMPUTE_NODE_NAME}` on your local machine, as well as forwarding the port from the compute node.

If you are using vscode and remote connect to use the local machine, there is an even easier way to do port forwarding.
You just need to press `ctrl+shift+p` for the menu and type in `port`, and select the option that says `forward a port`.
Then you can specify which local and remote ports you'd like to forward in a GUI setting.
Keep in mind that this does not last if you close your remote session.

## Managing Sessions

Tmux will make your life much easier when it comes to managing sessions and keeping code running even if you disconnect.
It's usually installed on most ubuntu machines.
If your machine does not have tmux installed and you don't have sudo access, you can install it through [conda](https://anaconda.org/conda-forge/tmux)(?!)
Make sure to activate the environment it is installed in before you are accessing your session though.
Refer to [this post](https://inwon.net/blog/iterm2-tmux-remote-integration) for more detailed usage on tmux/iterm.
If you are on a debian-based system, I also found [guake terminal](http://guake-project.org) quite useful.

# Quality-of-Life tools

## [Lazygit](https://github.com/jesseduffield/lazygit) / [Lazydocker](https://github.com/jesseduffield/lazydocker)

These two tools by the same author are basically pseudo-gui's for the terminal. On machines that you many not have access to nice gui softwares such as github descktop (you shouldn't be using this anyway) or docker desktop, these two tools can offer a similar functionality to their desktop counterparts. The installation process is pretty simple, just make sure you install it under your own user's directory if you are on a shared machine.

- [Lazygit](https://github.com/jesseduffield/lazygit)
- [Lazydocker](https://github.com/jesseduffield/lazydocker)

## VSCode Remote

VSCode provides a nice way of using remote machines using the `Remote - SSH` extension.
You can install this extension by searching for `remote` on the extensions sidebar.

![](/static/images/remote-computing-tips/vscode-remote-ssh.png)
