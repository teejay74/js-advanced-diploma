import getInfoCharacter from '../getInfoCharacter';

test('Тест вывода информации о vampire', () => {
  const characters = {
    type: 'vampire',
    health: 50,
    level: 1,
    attack: 25,
    defence: 25,
  };
  const received = getInfoCharacter(characters);
  const expected = '\u{1F396}1 \u{2694}25 \u{1F6E1}25 \u{2764}50';

  expect(received).toBe(expected);
});
