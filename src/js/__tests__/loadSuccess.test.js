import GameStateService from '../GameStateService';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('Тест успешной загрузки игры', () => {
  const stateService = new GameStateService();
  stateService.load.mockReturnValue('state');

  expect(stateService.load()).toBe('state');
});
