/* eslint-disable no-process-exit */
/* eslint-disable unicorn/no-process-exit */
import * as blessed from 'blessed'
import {getStack} from './stack'

export const run = async (room: string, nickname?: string) => {
  const {ipfs, stack, pubsub} = await getStack()

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
      await pubsub.publish(room, {nickname, message})
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

  await pubsub.subscribe(room, event => {
    messageList.addItem(`${event.data.nickname ? `${event.data.nickname} (${event.from.slice(-5)})` : event.from.slice(-5)}: ${event.data.message}`)
    messageList.scrollTo(100)
    screen.render()
  })

  setInterval(async () => {
    messageList.setLabel(` Messages #${room} - Peers: ${await pubsub.peers(room)} `)
    screen.render()
  }, 1000)

  messageList.scrollTo(100)
  screen.render()
}
