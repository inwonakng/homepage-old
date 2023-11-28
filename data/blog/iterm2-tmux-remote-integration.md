---
title: Using Iterm2 and Tmux for remote development
date: '2023-6-15'
tags: ['ssh', 'iterm2', 'tmux', 'remote-computing']
draft: false
summary: How to integrate Iterm2 with tmux on a remote ssh access
images: [
    /static/images/tmux-iterm2/iterm2-newtab.png
    /static/images/tmux-iterm2/hotkey-menu.png
    /static/images/tmux-iterm2/hotkey-menu-detail.png,
  ]
---

# What is Tmux?

[Tmux](https://github.com/tmux/tmux/wiki) is a tool used for managing sessions on the terminal. It's especially useful if you need to use multiple panes

## Basic Tmux Hotkeys

By default, `ctrl+b` is the `prefix` key in tmux. Toggling this key allows you to do things like creating/navigating between panes. For example, if you need to run a script on a remote machine that takes a while to execute, you can do it inside a tmux sessions to keep track of the script even if the remote connection is reset.

Here are some basic hotkeys that are useful for basic tmux manipulation. For more detailed instructions, you should refer to resources such as [tmux cheatsheet](https://tmuxcheatsheet.com)

### Spliting Panes

You can split panes vertically by pressing `prefix`, followed by `"`. This will create a new pane on the bottom half of your existing pane. To split the pane sidways, you can use `prefix` followed by `%`.
You can also navigate between the panes by pressing `prefix` , letting go, and pressing a directional (arrow) key. Note that if you press `prefix` and the arrow keys at the same time, you will resize the pane. You can also zoom into the current pane by pressing `prefix` and `z`. Once you are done, you can zoom out using the same key. You can also close a pane by pressing `ctrl + d`.

### Re-naming a session

`prefix` followed by `$` is the hotkey for renaming a session. This helps with tracking different sessions by giving them unique names if you are using multiple sessions. To create a session with a name, you can use `tmux new -s {session_name}`.

### Exiting and attaching to a session

To leave the session while keeping it running, you can use `prefix` followed by `d`. You can also list existing sessions by running `tmux ls` in bash, and connect to a session by `tmux attach -t ${session_name}`.

# What is Iterm?

[Iterm2](https://iterm2.com) is a mac application for terminal management. Similar to Tmux, you can create different tabs and keep sessions alive. However, Iterm2 is a terminal manager while Tmux is a terminal multiplexer. This means that Iterm's scope is a bit broader than Tmux's. With Iterm, you can also do things like setting a hotkey to toggle the terminal to the top, allowing you to easily hide and show the terminal without having to cycle through the various `alt+tab` windows.

## Basic Iterm Hotkeys

### Creating a new tab

Since Iterm is a terminal manager, you can also create 'tabs'. You can do this by pressing `cmd+t`.

### Splitting panes

To split a pane horizontally, press `cmd+d`. To split vertically, use `cmd+shift+d`. You can close a pane by pressing `cmd+w`, just like how you would close your tab in a web browser. Iterm also accepts `ctrl+d` key to close a pane. If there is only one pane, this closes the entire terminal, so be careful. To navigate between the panes in a window, you can use `cmd+option+arrow`. Unlike tmux, you'll notice that you do not have to press the keys sequentially. You can also cycle between different tabs by pressing `cmd+arrow`. To zoom in/out of a pane, you can press `cmd+shift+enter`.

### Setting up floating window

As mentioned before, you can also set a hotkey to show and hide the terminal window. You can do this in setting -> keys -> hotkey. Select `Create a Dedicated Hotkey Window` option if you want to have a single window bound to the hotkey, or set `Show/Hide all windows with a system-wide hotkey` option if you want to show all the terminals.

![](/static/images/tmux-iterm2/hotkey-menu.png)

![](/static/images/tmux-iterm2/hotkey-menu-detail.png)

Once you are done, you should be able to bring up the termianl window by pressing the designated hotkey. Be careful not to overwrite existing hotkeys in MacOS or any other software! I use `option + space`, which does not conflict with any software I use.

# How to use Iterm2 with a remote Tmux session

The official guidelines can be found [here](https://iterm2.com/documentation-tmux-integration.html).

**Step 1**. Attach to the remote host in an Iterm2 window.

**Step 2**. run `tmux -CC` or `tmux -CC attach -t {session_name}`

**Step 3**. Enjoy your integrated terminal!

Tip: If you don't want the tmux session to create a new terminal window, you can change the behavior in settings -> general -> tmux -> and toggling the `When attaching, restore window as:` option to `Tabs in the attaching window`.

![](/static/images/tmux-iterm2/iterm2-newtab.png)

If you want to achieve this in one line, you can also use this command:

```bash
ssh {user}@{hostname} -t 'tmux -CC attach -t {session_name}'
```

The `-t` flag for ssh tells it to execute the following command. By doing this, you are doing Step 1 and 2 at once.
If you would like to create a new session and attach right away, you can replace the tmux command with the following:

```bash
tmux -CC new -s {session_name}
```

Instead of `attach -t {session_name}` which attaches to an existing session, you are telling tmux to create a new session with the name.
The `-CC` flag tells it to use client mode, which allows iterm to natively connect.
