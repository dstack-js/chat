import {Command, flags} from '@oclif/command'
import {run} from './chat'

class DstackJsChat extends Command {
  static description = 'start chat'

  static flags = {
    version: flags.version({char: 'v'}),
  }

  static examples = [
    '$ peerchat',
    '$ peerchat ROOM NICKNAME',
    '$ peerchat dstack myCoolNickname',
  ]

  static args = [{name: 'room', default: 'dstack', description: 'chat room'}, {name: 'nickname', description: 'your nickname'}]

  async run() {
    const {args} = this.parse(DstackJsChat)
    run(args.room, args.nickname)
  }
}

export = DstackJsChat
