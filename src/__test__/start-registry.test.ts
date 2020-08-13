/* eslint-env node */

import { startRegistry } from '..'

describe('@carv/registry-mock: startRegistry', () => {
  test('should start', async () => {
    const registry = await startRegistry()

    try {
      const response = await registry.ping()

      expect(response).toHaveProperty('_etag')
    } finally {
      await registry.shutdown()
    }
  })
})
