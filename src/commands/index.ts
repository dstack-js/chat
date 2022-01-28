import {Command, flags} from '@oclif/command'
import {run} from '../services/chat'

export default class PeerChat extends Command {
  static description = 'Peer-to-peer terminal chat running on DStack'

  static flags = {
    version: flags.version({char: 'v'}),
  }

  static examples = [
    '$ peerchat',
    '$ peerchat [ROOM] [NICKNAME]',
    '$ peerchat dstack myCoolNickname',
  ]

  static args = [{name: 'room', default: 'dstack', description: 'chat room'}, {name: 'nickname', description: 'your nickname'}]

  async run() {
    const {args} = this.parse(PeerChat)
    await run(args.room, args.nickname)
  }
}
