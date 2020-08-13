export default {
  packages: {
    '@private/*': {
      access: '$authenticated',
      publish: '$authenticated',
    },
    '**': {
      access: '$all',
      publish: '$authenticated',
    },
  },
  security: {
    api: {
      legacy: true,
      jwt: {
        sign: {
          expiresIn: '10m',
        },
      },
    },
  },
  logs: [
    {
      type: 'stdout',
      format: 'pretty',
      level: 'error',
    },
  ],
  server: {
    keepAliveTimeout: 1,
  },
  web: {
    enable: false,
  },
}
