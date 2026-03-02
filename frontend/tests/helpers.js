import { render } from '@testing-library/react'

// Helper para renderizar con providers si es necesario
export function renderWithProviders(
  component,
  {
    preloadedState = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return children
  }

  return render(component, { wrapper: Wrapper, ...renderOptions })
}

// Helpers comunes
export { screen, within } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Mock de fetch
export function mockFetch(response = {}) {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => response,
  })
}

export function mockFetchError(message = 'Error') {
  global.fetch.mockRejectedValueOnce(new Error(message))
}
