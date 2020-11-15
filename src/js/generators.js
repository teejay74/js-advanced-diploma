/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const characterIndex = Math.floor(Math.random() * allowedTypes.length);
    const characterLevel = Math.floor((Math.random() * maxLevel) + 1);
    yield new allowedTypes[characterIndex](characterLevel);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = [];
  const character = characterGenerator(allowedTypes, maxLevel);
  for (let i = 0; i < characterCount; i += 1) {
    team.push(character.next().value);
  }
  return team;
}
