import * as blessed from 'blessed'
import { getStack } from './stack'

export const run = async (room: string, nickname?: string) => {
  const { ipfs, stack } = await getStack()
  const { id } = await stack.id()

  const pubsub = stack.pubsub.create<{ nickname?: string; message: string }>(`chat-${room}`)
  const screen = blessed.screen({
    smartCSR: true,
    title: `#${room}`
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
      `dstack: your id is ${id.slice(-5)}`,
      'dstack: use /help to see commands'
    ]
  })

  // Append our box to the screen.
  const input = blessed.textarea({
    bottom: 0,
    height: '10%',
    inputOnFocus: true,
    clickable: true,
    label: ` ID: ${id.slice(-5)} `,
    padding: {
      top: 1,
      left: 2
    },
    style: {
      fg: '#787878',
      bg: '#454545',

      focus: {
        fg: '#f6f6f6',
        bg: '#353535'
      }
    }
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
      const { addresses } = await ipfs.id()

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

      if (peers.length === 0) {
        messageList.addItem('dstack: no peers')
      } else {
        for (const peer of peers) {
          messageList.addItem(`dstack: ${peer.id}`)
        }
      }

      input.clearValue()
      screen.render()
      return
    }

    try {
      await pubsub.publish('message', { nickname, message })
    } catch {
      // error handling
    } finally {
      input.clearValue()
      screen.render()
    }
  })

  screen.key(['escape', 'q', 'C-c'], () => {
    process.exit(0)
  })

  input.key(['C-c'], () => {
    process.exit(0)
  })

  screen.append(messageList)
  screen.append(input)
  input.focus()

  await pubsub.subscribe('message', event => {
    messageList.addItem(`${event.data.nickname ? `${event.data.nickname} (${event.from.slice(-5)})` : event.from.slice(-5)}: ${event.data.message}`)
    messageList.scrollTo(100)
    screen.render()
  })

  setInterval(async () => {
    messageList.setLabel(` Messages #${room} - Peers: ${await pubsub.peers('message')} `)
    screen.render()
  }, 1000)

  messageList.scrollTo(100)
  screen.render()
}
