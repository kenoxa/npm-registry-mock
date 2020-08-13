declare module 'verdaccio' {
  import http from 'http'
  import { Config, ListenAddress } from '@verdaccio/types'

  type Callback = (
    webServer: http.Server,
    addr: ListenAddress,
    pkgVersion: string,
    pkgName: string,
  ) => void

  function startVerdaccio(
    config: Config,
    cliListen: string,
    configPath: string,
    pkgVersion: string,
    pkgName: string,
    callback: Callback,
  ): void

  export = startVerdaccio
}

declare module 'tar-stream' {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  interface Header {
    name: string

    type?:
      | 'file'
      | 'link'
      | 'symlink'
      | 'directory'
      | 'block-device'
      | 'character-device'
      | 'fifo'
      | 'contiguous-file'

    linkname?: string

    size?: number
    mode?: number
    mtime?: Date
    uid?: number
    gid?: number
    uname?: string
    gname?: string
    devmajor?: number
    devminor?: number
  }

  interface Pack extends NodeJS.ReadableStream {
    entry(
      header: Header,
      data: string | Buffer | NodeJS.ReadableStream,
      callback?: (error: Error) => void,
    ): NodeJS.WritableStream

    entry(header: Header, callback?: (error: Error) => void): NodeJS.WritableStream

    finalize(): void

    destroy(error?: Error): void
  }

  export function pack(): Pack
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}

declare module 'npm-registry-client' {
  // https://github.com/npm/npm-registry-client/blob/14efa6848ca1e7278de0eb12a1430cdb85bddf02/index.js#L26
  type LogFunction = (prefix: string, message: string, ...args: unknown[]) => void
  interface Log {
    level?: string

    error: LogFunction
    warn: LogFunction
    info: LogFunction
    verbose: LogFunction
    silly: LogFunction
    http: LogFunction

    pause: () => void
    resume: () => void
  }
  interface RegClientOptions {
    proxy?: {
      http?: string
      https?: string
    }

    ssl?: {
      strict?: boolean
    }

    retry?: {
      retries?: number
      factor?: number
      minTimeout?: number
      maxTimeout?: number
      maxSockets?: number
    }

    userAgent?: string

    defaultTag?: string

    log?: Log
  }

  class RegClient {
    constructor(config?: RegClientOptions)

    log: Log

    ping(
      uri: string,
      params: {
        auth: { token: string } | { password: string; username: string; email: string }
      },
      callback:
        | ((error: Error) => void)
        | ((
            error: null,
            data: {
              _etag?: string
            },
            raw: string,
            response: import('http').IncomingMessage,
          ) => void),
    ): void

    publish(
      uri: string,
      params: {
        access?: 'public' | 'restricted'
        auth: { token: string } | { password: string; username: string; email: string }
        metadata: import('type-fest').PackageJson
        body: import('stream').Stream
      },
      callback:
        | ((error: Error) => void)
        | ((
            error: null,
            data: {
              ok: string
              success: true
              _etag?: string
            },
            raw: string,
            response: import('http').IncomingMessage,
          ) => void),
    ): void
  }

  export = RegClient
}
