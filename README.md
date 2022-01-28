peerchat
===============

Peer-to-peer terminal chat based on [DStack](https://github.com/dstack-js/dstack)

Checkout [DStack blog post](https://dstack.0x77.dev/blog/peerchat) to learn more

[![asciicast](https://asciinema.org/a/465056.svg)](https://asciinema.org/a/465056)

_Recording looks ugly, but in terminal it seems to be fine_

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/peerchat.svg)](https://npmjs.org/package/peerchat)
[![Downloads/week](https://img.shields.io/npm/dw/peerchat.svg)](https://npmjs.org/package/peerchat)
[![License](https://img.shields.io/npm/l/peerchat.svg)](https://github.com/dstack-js/chat/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g peerchat
$ peerchat COMMAND
running command...
$ peerchat (-v|--version|version)
peerchat/0.0.3 darwin-x64 node-v16.13.1
$ peerchat --help [COMMAND]
USAGE
  $ peerchat COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`peerchat [ROOM] [NICKNAME]`](#peerchat-room-nickname)
* [`peerchat discord [ROOM]`](#peerchat-discord-room)
* [`peerchat help [COMMAND]`](#peerchat-help-command)

## `peerchat [ROOM] [NICKNAME]`

Peer-to-peer terminal chat running on DStack

```
USAGE
  $ peerchat [ROOM] [NICKNAME]

ARGUMENTS
  ROOM      [default: dstack] chat room
  NICKNAME  your nickname

OPTIONS
  -v, --version  show CLI version

EXAMPLES
  $ peerchat
  $ peerchat [ROOM] [NICKNAME]
  $ peerchat dstack myCoolNickname
```

_See code: [src/commands/index.ts](https://github.com/dstack-js/chat/blob/v0.0.3/src/commands/index.ts)_

## `peerchat discord [ROOM]`

Peerchat <-> Discord

```
USAGE
  $ peerchat discord [ROOM]

ARGUMENTS
  ROOM  [default: dstack] chat room

OPTIONS
  -v, --version  show CLI version

EXAMPLES
  $ peerchat discord
  $ peerchat discord [ROOM]
  $ peerchat discord dstack
```

_See code: [src/commands/discord/index.ts](https://github.com/dstack-js/chat/blob/v0.0.3/src/commands/discord/index.ts)_

## `peerchat help [COMMAND]`

Display help for peerchat.

```
USAGE
  $ peerchat help [COMMAND]

ARGUMENTS
  COMMAND  Command to show help for.

OPTIONS
  -n, --nested-commands  Include all nested commands in the output.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_
<!-- commandsstop -->
