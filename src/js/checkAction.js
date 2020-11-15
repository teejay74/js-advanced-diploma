export function checkAction(position, distance, boardSize) {
  const values = [];
  const indexStr = Math.floor(position / boardSize);
  const indexColumn = position % boardSize;

  for (let i = 1; i <= distance; i += 1) {
    if (indexColumn + i < boardSize) {
      values.push(indexStr * boardSize + (indexColumn + i));
    }
    if (indexColumn - i >= 0) {
      values.push(indexStr * boardSize + (indexColumn - i));
    }
    if (indexStr + i < boardSize) {
      values.push((indexStr + i) * boardSize + indexColumn);
    }
    if (indexStr - i >= 0) {
      values.push((indexStr - i) * boardSize + indexColumn);
    }
    if (indexStr + i < boardSize && indexColumn + i < boardSize) {
      values.push((indexStr + i) * boardSize + (indexColumn + i));
    }
    if (indexStr - i >= 0 && indexColumn - i >= 0) {
      values.push((indexStr - i) * boardSize + (indexColumn - i));
    }
    if (indexStr + i < boardSize && indexColumn - i >= 0) {
      values.push((indexStr + i) * boardSize + (indexColumn - i));
    }
    if (indexStr - i >= 0 && indexColumn + i < boardSize) {
      values.push((indexStr - i) * boardSize + (indexColumn + i));
    }
  }
  console.log(values);
  return values;
}

export function checkActionAttack(position, distance, boardSize) {
  const boardValues = [];
  let arrayString = [];
  for (let i = 0; i < boardSize ** 2; i += 1) {
    arrayString.push(i);
    if (arrayString.length === boardSize) {
      boardValues.push(arrayString);
      arrayString = [];
    }
  }
  const indexStr = Math.ceil(((position - (position % boardSize)) / boardSize));
  const indexColumn = position % boardSize;

  let indexStrMin = indexStr - distance;
  if (indexStrMin < 0) { indexStrMin = 0; }
  let indexStrMax = indexStr + distance;
  if (indexStrMax > boardSize - 1) { indexStrMax = boardSize - 1; }

  let indexColumnMin = indexColumn - distance;
  if (indexColumnMin < 0) { indexColumnMin = 0; }
  let indexColumnMax = indexColumn + distance;
  if (indexColumnMax > boardSize - 1) { indexColumnMax = boardSize - 1; }

  const values = [];
  for (let i = indexStrMin; i <= indexStrMax; i += 1) {
    for (let j = indexColumnMin; j <= indexColumnMax; j += 1) {
      values.push(boardValues[i][j]);
    }
  }

  return values;
}

function getRandomPosition(fieldComputer = 0) {
  return (Math.floor(Math.random() * 8) * 8) + ((Math.floor(Math.random() * 2) + fieldComputer));
}

export function getPositions(length) {
  let randomPosition;
  const position = {
    user: [],
    computer: [],
  };
  for (let i = 0; i < length; i += 1) {
    do {
      randomPosition = getRandomPosition();
    } while (position.user.includes(randomPosition));
    position.user.push(randomPosition);
    do {
      randomPosition = getRandomPosition(6);
    } while (position.computer.includes(randomPosition));
    position.computer.push(randomPosition);
  }
  return position;
}

export function forceUnit(currentStat, hp) {
  return Math.floor(Math.max(currentStat, currentStat * (1.8 - hp / 100)));
}
