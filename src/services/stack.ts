import { create } from '@dstack-js/ipfs'
import { Stack } from '@dstack-js/lib'
// @ts-expect-error: no types
import WebRTCStar from 'libp2p-webrtc-star'
// @ts-expect-error: no types
import WebSocket from 'libp2p-websockets'
import { getBootstrapData } from './bootstrap'

const wrtc = require('wrtc')

export const getStack = async () => {
  const bootstrap = await getBootstrapData()
  console.log(bootstrap)

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
        Swarm: bootstrap.listen
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
      Bootstrap: bootstrap.peers
    },
    libp2p: {
      // @ts-expect-error: incompatible types
      modules: {
        transport: [WebRTCStar, WebSocket]
      },
      addresses: {
        listen: bootstrap.listen
      }
    }
  }, wrtc)

  const stack = await Stack.create('dstack', ipfs)

  return { stack, ipfs }
}
