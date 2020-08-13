import type { Server as HTTPServer } from 'http'
import type { PackageJson as TPackageJson } from 'type-fest'
import type { Config } from '@verdaccio/types'

import { URL, fileURLToPath, pathToFileURL } from 'url'
import { dirname, relative } from 'path'
import { createRequire } from 'module'

import startVerdaccio from 'verdaccio'
import { name as pkgName, version as pkgVersion } from 'verdaccio/package.json'
import pEvent from 'p-event'
import RegistryClient from 'npm-registry-client'
import tar from 'tar-stream'
import pkgDir from 'pkg-dir'

import config from './config'

const FILE_URL = (import.meta.url || pathToFileURL(__filename)).toString()
const { resolve } = createRequire(FILE_URL)

const USERS = {
  publisher: {
    name: 'publisher',
    password: 's3cret',
  },
}

export interface PackageJson extends TPackageJson {
  name: string
  version: string
  [key: string]: unknown
}

export class MockRegistry {
  constructor(server: HTTPServer) {
    this.server = server

    this.client.log.level = 'error'
  }

  readonly server: HTTPServer

  readonly client: RegistryClient = new RegistryClient({
    retry: {
      factor: 2,
      minTimeout: 50,
      maxTimeout: 1000,
    },
  })

  get url(): string {
    const address = this.server.address()

    if (!address) throw new Error('no address')

    return typeof address === 'string' ? address : `http://${address.address}:${address.port}`
  }

  ping(): Promise<{ _etag?: string }> {
    return new Promise((resolve, reject) => {
      this.client.ping(
        this.url,
        {
          auth: {
            username: USERS.publisher.name,
            password: USERS.publisher.password,
            email: `publisher@carv.io`,
          },
        },
        (error, data) => {
          error ? reject(error) : resolve(data)
        },
      )
    })
  }

  publish(
    manifest: PackageJson,
    files: { [file: string]: string } = {},
  ): Promise<{
    ok: string
    success: true
    _etag?: string
  }> {
    return new Promise((resolve, reject) => {
      const pack = tar.pack()

      pack.entry({ name: 'package/package.json' }, JSON.stringify(manifest))

      Object.entries(files).forEach(([file, content]) => {
        pack.entry({ name: `package/${file}` }, content)
      })

      pack.finalize()

      this.client.publish(
        this.url,
        {
          auth: {
            username: USERS.publisher.name,
            password: USERS.publisher.password,
            email: `publisher@carv.io`,
          },
          metadata: manifest,
          body: pack,
        },
        (error, data) => {
          error ? reject(error) : resolve(data)
        },
      )
    })
  }

  shutdown(): Promise<void> {
    const closed = pEvent(this.server, 'close')
    this.server.close()
    return closed
  }
}

export async function startRegistry(): Promise<MockRegistry> {
  const configPath = fileURLToPath(new URL('./config.yaml', FILE_URL).href)

  const plugins = dirname((await pkgDir(fileURLToPath(FILE_URL))) as string)

  const verdaccioMemory = relative(plugins, (await pkgDir(resolve('verdaccio-memory'))) as string)
  const verdaccioAuthMemory = relative(
    plugins,
    (await pkgDir(resolve('verdaccio-auth-memory'))) as string,
  )

  Object.assign(config, {
    plugins,

    store: {
      [verdaccioMemory]: {
        limit: 1000,
      },
    },

    auth: {
      [verdaccioAuthMemory]: {
        users: USERS,
      },
    },
  })

  return new Promise((resolve, reject) => {
    startVerdaccio(
      (config as unknown) as Config,
      '127.0.0.1:0',
      configPath,
      pkgVersion,
      pkgName,
      (server) => {
        try {
          server.listen(0, '127.0.0.1')
        } catch (error) {
          return reject(error)
        }

        pEvent(server, 'listening')
          .then(() => new MockRegistry(server))
          .then(resolve)
          .catch(reject)
      },
    )
  })
}
