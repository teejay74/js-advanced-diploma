import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

const allCharacters = [Bowman, Swordsman, Magician, Daemon, Undead, Vampire];
const userTeamTwo = [Bowman, Swordsman];
const userTeamThree = [Bowman, Swordsman, Magician];
const computerTeam = [Daemon, Undead, Vampire];

class Team {
  constructor() {
    this.allCharacters = allCharacters;
    this.userTeamTwo = userTeamTwo;
    this.userTeamThree = userTeamThree;
    this.computerTeam = computerTeam;
  }
}

const newTeam = new Team();
export default newTeam;
