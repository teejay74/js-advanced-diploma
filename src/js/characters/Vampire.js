import Character from '../Character';

export default class Vampire extends Character {
  constructor(level) {
    super(level);
    this.type = 'vampire';
    this.attack = 25;
    this.defence = 25;
    this.distance = 2;
    this.distanceAttack = 2;
  }
}
