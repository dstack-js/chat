import { request, gql } from 'graphql-request'
import { URL } from 'node:url'

export const getBootstrapData = async () => {
  const endpoint = process.env.RELAY_GRAPHQL_ENDPOINT || 'https://relay.dstack.dev:443/graphql'
  const url = new URL(endpoint)

  const query = gql`
    query Bootstrap($protocol: Protocol!, $hostname: String!, $port: Int!) {
      listen(protocol: $protocol, hostname: $hostname, port: $port)
      peers(randomize: true)
    }
  `

  return request<{ listen: string[]; peers: string[] }>(endpoint, query, { protocol: url.protocol.replace(':', ''), hostname: url.hostname, port: Number(url.port || '443') })
}
