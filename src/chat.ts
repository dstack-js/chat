/* eslint-disable node/no-extraneous-import */
/* eslint-disable no-process-exit */
/* eslint-disable unicorn/no-process-exit */
import {create} from '@dstack-js/ipfs'
import {Stack} from '@dstack-js/lib'
import {PubSub} from '@dstack-js/lib/src/pubsub'
const wrtc = require('wrtc')
import * as blessed from 'blessed'
import {notify} from 'node-notifier'

interface Message {
  nickname?: string;
  message: string;
}

export const run = async (room: string, nickname?: string) => {
  const ipfs = await create({
    repo: process.env.IPFS_REPO,
    relay: {
      enabled: true, // enable relay dialer/listener (STOP)
      hop: {
        enabled: true, // make this node a relay (HOP)
      },
    },
    config: {
      Addresses: {
        Swarm: ['/ip4/0.0.0.0/tcp/0', '/dns4/dstack-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star'],
      },
      Discovery: {
        MDNS: {
          Enabled: true,
          Interval: 1,
        },
        webRTCStar: {
          Enabled: true,
        },
      },
      Bootstrap: ['/dns4/dstack-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/QmV2uXBKbii29iJKHKVy8sx5m49qdDTBYNybVoa5uLJtrf'],
    },
  }, wrtc)

  const stack = await Stack.create('dstack-chat', ipfs)
  const pubsub = stack.pubsub as PubSub<Message>

  const screen = blessed.screen({
    smartCSR: true,
    title: `#${room}`,
  })

  const messageList = blessed.list({
    align: 'left',
    mouse: true,
    keys: true,
    width: '100%',
    height: '90%',
    border: 'line',
    top: 0,
    left: 0,
    items: [
      'dstack: connected',
      `dstack: your id is ${stack.id.slice(-5)}`,
      'dstack: use /help to see commands',
    ],
  })

  // Append our box to the screen.
  const input = blessed.textarea({
    bottom: 0,
    height: '10%',
    inputOnFocus: true,
    clickable: true,
    label: ` ID: ${stack.id.slice(-5)} `,
    padding: {
      top: 1,
      left: 2,
    },
    style: {
      fg: '#787878',
      bg: '#454545',

      focus: {
        fg: '#f6f6f6',
        bg: '#353535',
      },
    },
  })

  input.key('enter', async function () {
    const message = input.getValue()
    if (message.length === 0) return

    if (message.startsWith('/connect ')) {
      await stack.ipfs.swarm.connect(message.split('/connect ')[1])
      input.clearValue()
      screen.render()
      return
    }

    if (message.startsWith('/addr')) {
      const {addresses} = await ipfs.id()

      for (const addr of addresses) {
        messageList.addItem(`dstack: ${addr.toString()}`)
      }

      input.clearValue()
      screen.render()
      return
    }

    if (message.startsWith('/help')) {
      messageList.addItem('dstack: /addr - your addresses')
      messageList.addItem('dstack: /connect <addr> - manually connect to peer')
      messageList.addItem('dstack: /peers - peers list')
      input.clearValue()
      screen.render()
      return
    }

    if (message.startsWith('/peers')) {
      const peers = await stack.peers()

      for (const peer of peers) {
        messageList.addItem(`dstack: ${peer.id}`)
      }

      input.clearValue()
      screen.render()
      return
    }

    try {
      await pubsub.publish('chat', {nickname, message})
    } catch {
      // error handling
    } finally {
      input.clearValue()
      screen.render()
    }
  })

  screen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0)
  })

  screen.append(messageList)
  screen.append(input)
  input.focus()

  await pubsub.subscribe('chat', event => {
    const name = event.data.nickname ? `${event.data.nickname} (${event.from.slice(-5)})` : event.from.slice(-5)
    messageList.addItem(`${name}: ${event.data.message}`)

    try {
      if (event.from !== stack.id) notify({
        title: `Peerchat #${room} | ${name}`,
        message: event.data.message,
      })
    } catch {}

    messageList.scrollTo(100)
    screen.render()
  })

  stack.onPeerConnect(async peer => {
    messageList.setLabel(` Messages #${room} - Peers: ${await pubsub.peers('chat')} `)
    messageList.addItem(`dstack: peer connected ${peer.id.slice(-5)}`)
    messageList.scrollTo(100)
    screen.render()
  })

  setInterval(async () => {
    messageList.setLabel(` Messages #${room} - Peers: ${await pubsub.peers('chat')} `)
    screen.render()
  }, 1000)

  messageList.scrollTo(100)
  screen.render()
}
