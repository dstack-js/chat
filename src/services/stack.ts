import { create } from '@dstack-js/ipfs'
import { Stack } from '@dstack-js/lib'
import type { PubSub } from '@dstack-js/lib/src/pubsub'
const wrtc = require('wrtc')

interface Message {
  nickname?: string;
  message: string;
}

export const getStack = async () => {
  const ipfs = await create({
    repo: process.env.IPFS_REPO,
    init: {
      privateKey: process.env.PEERCHAT_PRIVATE_KEY
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true
      }
    },
    config: {
      Addresses: {
        Swarm: ['/ip4/0.0.0.0/tcp/0', '/dns4/dstack-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star']
      },
      Discovery: {
        MDNS: {
          Enabled: true,
          Interval: 1
        },
        webRTCStar: {
          Enabled: true
        }
      },
      Bootstrap: ['/dns4/dstack-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/QmV2uXBKbii29iJKHKVy8sx5m49qdDTBYNybVoa5uLJtrf']
    }
  }, wrtc)

  const stack = await Stack.create('dstack-chat', ipfs)
  const pubsub = stack.pubsub as PubSub<Message>

  return { pubsub, stack, ipfs }
}
