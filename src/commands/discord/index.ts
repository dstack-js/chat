import { Command, flags } from '@oclif/command'
import PeerChat from '..'
import { getStack } from '../../services/stack'
import Discord, { Intents } from 'discord.js'

class DiscordRelay extends Command {
  static description = 'Peerchat/Discord relay'

  static flags = {
    version: flags.version({ char: 'v' })
  }

  static examples = [
    '$ CHANNEL_ID="<discord channel id>" DISCORD_KEY="<discord bot token>" peerchat discord',
    '$ CHANNEL_ID="<discord channel id>" DISCORD_KEY="<discord bot token>" peerchat discord [ROOM]',
    '$ CHANNEL_ID="<discord channel id>" DISCORD_KEY="<discord bot token>" peerchat discord dstack'
  ]

  static args = [{ name: 'room', default: PeerChat.args[0].default, description: 'chat room' }]

  async run() {
    const { args } = this.parse(DiscordRelay)

    if (!process.env.DISCORD_KEY) {
      throw new Error('DISCORD_KEY env is missing')
    }

    const { stack } = await getStack()
    const { pubsub } = stack

    const client = new Discord.Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES] })
    await client.login(process.env.DISCORD_KEY)

    client.on('message', async msg => {
      if (msg.author.bot) return

      await pubsub.publish(args.room, { nickname: msg.author.tag, message: msg.content })
    })

    await pubsub.subscribe(args.room, async event => {
      const channel = await client.channels.fetch(process.env.CHANNEL_ID || '936448590170177556')

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      if (!channel || !channel.isText()) {
        throw new Error('CHANNEL_ID env is invalid')
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      channel.send(`${event.data.nickname ? `${event.data.nickname} (${event.from.slice(-5)})` : event.from.slice(-5)}: ${event.data.message}`)
    })
  }
}

export = DiscordRelay
