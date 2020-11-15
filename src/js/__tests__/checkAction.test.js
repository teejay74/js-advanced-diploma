import { checkAction, checkActionAttack } from '../checkAction';

test('Тест расчета хода', () => {
  const expected = checkAction(1, 2, 8);
  const received = [2, 0, 9, 10, 8, 3, 17, 19];
  expect(received).toEqual(expected);
});

test('Тест расчета атаки', () => {
  const expected = checkActionAttack(2, 2, 8);
  const received = [0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 16, 17, 18, 19, 20];
  expect(received).toEqual(expected);
});
