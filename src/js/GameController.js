import {
  checkAction, checkActionAttack, getPositions, forceUnit,
} from './checkAction';
import Team from './Team';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import cursors from './cursors';
import getInfoCharacter from './getInfoCharacter';
import themes from './themes';
import GamePlay from './GamePlay';
import GameState from './GameState';

let currentUnitNumber = 0;
let checkedDistance;
let checkedPosition;
let boardSize;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentTheme = themes.prairie;
    this.currentCharacter = {};
    this.selectedCell = false;
    this.stage = 1;
    this.blockGame = false;
    this.score = 0;
    this.userPositions = [];
    this.cpuPositions = [];
  }

  init() {
    this.letsPlay();
    this.events();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  // Запуск уровней
  letsPlay() {
    this.run = 'user';
    switch (this.stage) {
      case 1:
        this.userTeams = generateTeam(Team.userTeamTwo, 1, 2);
        this.computerTeams = generateTeam(Team.computerTeam, 1, 2);
        this.setPositionCharacter(this.userTeams, this.computerTeams);
        break;
      case 2:
        this.currentTheme = themes.desert;
        this.userTeams = generateTeam(Team.userTeamThree, 1, 1);
        this.computerTeams = generateTeam(
          Team.computerTeam, 2,
          this.userTeams.length + this.userPositions.length,
        );
        this.setPositionCharacter(this.userTeams, this.computerTeams);
        GamePlay.showMessage('Уровень 2');
        break;
      case 3:
        this.currentTheme = themes.arctic;
        this.userTeams = generateTeam(Team.userTeamThree, 2, 2);
        this.computerTeams = generateTeam(
          Team.computerTeam, 3,
          this.userTeams.length + this.userPositions.length,
        );
        this.setPositionCharacter(this.userTeams, this.computerTeams);
        GamePlay.showMessage('Уровень 3');
        break;
      case 4:
        this.currentTheme = themes.mountain;
        this.userTeams = generateTeam(Team.userTeamThree, 3, 2);
        this.computerTeams = generateTeam(
          Team.computerTeam, 4,
          this.userTeams.length + this.userPositions.length,
        );
        this.setPositionCharacter(this.userTeams, this.computerTeams);
        GamePlay.showMessage('Уровень 4');
        break;
      default:
        this.blockGame = true;
        GamePlay.showMessage(`Победа! Ваши баллы: ${this.score}`);
        break;
    }
    if (!this.blockGame) {
      const characterPositions = getPositions(this.userPositions.length);
      for (let i = 0; i < this.userPositions.length; i += 1) {
        this.userPositions[i].position = characterPositions.user[i];
        this.cpuPositions[i].position = characterPositions.computer[i];
      }
      this.gamePlay.drawUi(this.currentTheme);
      this.gamePlay.redrawPositions([...this.userPositions, ...this.cpuPositions]);
    }
  }

  setPositionCharacter(userTeams, computerTeams) {
    for (let i = 0; i < userTeams.length; i += 1) {
      this.userPositions.push(new PositionedCharacter(userTeams[i], 0));
    }
    for (let i = 0; i < computerTeams.length; i += 1) {
      this.cpuPositions.push(new PositionedCharacter(computerTeams[i], 0));
    }
  }

  events() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  async onCellClick(index) {
    // TODO: react to click
    this.index = index;
    if (this.blockGame) {
      return;
    }
    if (this.checkPosition(this.userPositions) !== -1) {
      this.gamePlay.deselectCell(currentUnitNumber);
      this.gamePlay.selectCell(index);
      currentUnitNumber = index;
      this.currentCharacter = [...this.userPositions].find(
        (item) => item.position === index,
      );
      this.selectedCell = true;
      return;
    }
    if (this.selectedCell && this.gamePlay.boardEl.style.cursor === 'pointer') {
      this.currentCharacter.position = index;
      this.gamePlay.deselectCell(currentUnitNumber);
      this.gamePlay.deselectCell(index);
      this.selectedCell = false;
      this.gamePlay.redrawPositions([...this.userPositions, ...this.cpuPositions]);
      this.run = 'computer';
      this.strategyComputer();
      return;
    }
    if (this.selectedCell
      && this.gamePlay.boardEl.style.cursor === 'crosshair') {
      const targetAttack = [...this.cpuPositions].find(
        (item) => item.position === index,
      );
      this.gamePlay.deselectCell(currentUnitNumber);
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.auto);
      await this.actionAttack(
        this.currentCharacter.character,
        targetAttack,
      );
      if (this.cpuPositions.length > 0) {
        this.strategyComputer();
      }
      return;
    }
    GamePlay.showError('Выбирите вашего персонажа!');
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.index = index;
    if (this.blockGame) {
      return;
    }
    for (const item of [...this.userPositions, ...this.cpuPositions]) {
      if (item.position === index) {
        this.gamePlay.showCellTooltip(
          getInfoCharacter(item.character),
          index,
        );
      }
      if (this.checkPosition([...this.userPositions]) !== -1) {
        this.gamePlay.setCursor(cursors.pointer);
      }

      if (this.selectedCell) {
        checkedPosition = this.currentCharacter.position;
        checkedDistance = this.currentCharacter.character.distance;
        boardSize = this.gamePlay.boardSize;

        const freeWay = checkAction(
          checkedPosition,
          checkedDistance,
          boardSize,
        );

        checkedDistance = this.currentCharacter.character.distanceAttack;
        const freeAttack = checkActionAttack(
          checkedPosition,
          checkedDistance,
          boardSize,
        );
        if (this.checkPosition(this.userPositions) !== -1) {
          this.gamePlay.setCursor(cursors.pointer);
          return;
        }
        if (
          freeWay.includes(index)
            && this.checkPosition([...this.userPositions, ...this.cpuPositions]) === -1) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
          return;
        }
        if (freeAttack.includes(index)
            && this.checkPosition(this.cpuPositions) !== -1) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
          return;
        }
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.currentCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  checkPosition(arr) {
    return arr.findIndex((el) => el.position === this.index);
  }

  // Функция атаки
  async actionAttack(forward, target) {
    const targetCharacter = target.character;
    let damage = Math.max(forward.attack - targetCharacter.defence, forward.attack * 0.1);
    damage = Math.floor(damage);
    await this.gamePlay.showDamage(target.position, damage);
    targetCharacter.health -= damage;
    this.run = this.run === 'computer' ? 'user' : 'computer';
    if (targetCharacter.health > 0) {
      this.gamePlay.redrawPositions([...this.userPositions, ...this.cpuPositions]);
      return;
    }
    this.userPositions = this.userPositions.filter((unit) => unit.position !== target.position);
    this.cpuPositions = this.cpuPositions.filter((unit) => unit.position !== target.position);
    if (this.userPositions.length === 0) {
      GamePlay.showMessage('Вы проиграли :(');
      this.blockGame = true;
    }
    if (this.cpuPositions.length === 0) {
      for (const unit of this.userPositions) {
        this.score += unit.character.health;
      }
      this.levelUp();
      this.stage += 1;
      this.letsPlay();
    }

    this.gamePlay.redrawPositions([...this.userPositions, ...this.cpuPositions]);
  }

  // Повышаем уровень персонажа
  levelUp() {
    for (const unit of this.userPositions) {
      unit.character.level += 1;
      unit.character.attack = forceUnit(unit.character.attack, unit.character.health);
      unit.character.defence = forceUnit(unit.character.defence, unit.character.health);
      unit.character.health = (unit.character.health + 80) < 100 ? unit.character.health + 80 : 100;
    }
  }

  // Стратегия ходов - Компьютер
  strategyComputer() {
    for (const computerUnit of [...this.cpuPositions]) {
      checkedDistance = computerUnit.character.distanceAttack;
      checkedPosition = computerUnit.position;
      boardSize = this.gamePlay.boardSize;
      const checkedAttack = checkActionAttack(
        checkedPosition,
        checkedDistance,
        boardSize,
      );
      const target = this.computerAttack(checkedAttack);
      if (target !== null) {
        this.computersAttack(computerUnit.character, target);
        return;
      }
    }
    // Выбор активного персонажа - Компьютер
    const i = Math.floor(
      Math.random() * [...this.cpuPositions].length,
    );
    const activeUnit = [...this.cpuPositions][i];
    this.actionMove(activeUnit);

    this.gamePlay.redrawPositions([...this.userPositions, ...this.cpuPositions]);
    this.run = 'user';
  }

  computerAttack(checkedAttack) {
    for (const targetUser of [...this.userPositions]) {
      if (checkedAttack.includes(targetUser.position)) {
        return targetUser;
      }
    }
    return null;
  }

  async computersAttack(character, target) {
    await this.actionAttack(character, target);
  }

  // Действие движение - Компьютер
  actionMove(computerUnit) {
    const cpuUnit = computerUnit;
    const computerUnitDistance = cpuUnit.character.distance;
    const cpuUnitStr = this.checkStr(cpuUnit.position);
    const cpuUnitColumn = this.checkColumn(cpuUnit.position);
    let distanceStr;
    let distanceColumn;
    let distanceTarget;
    let nearTarget = {};
    let locX;
    let locY;

    for (const target of [...this.userPositions]) {
      const targetStr = this.checkStr(target.position);
      const targetColumn = this.checkColumn(target.position);
      distanceStr = cpuUnitStr - targetStr;
      distanceColumn = cpuUnitColumn - targetColumn;
      distanceTarget = Math.abs(distanceStr) + Math.abs(distanceColumn);
      if (nearTarget.distance === undefined || distanceTarget < nearTarget.distance) {
        nearTarget = {
          distanceX: distanceStr,
          distanceY: distanceColumn,
          distance: distanceTarget,
          locX: targetStr,
          locY: targetColumn,
          type: target.character.type,
        };
      }
    }

    // Движение активного персонажа по диагонали - Компьютер
    if (Math.abs(nearTarget.distanceX) === Math.abs(nearTarget.distanceY)) {
      if (Math.abs(nearTarget.distanceX) > computerUnitDistance) {
        locX = (cpuUnitStr - (computerUnitDistance * Math.sign(nearTarget.distanceX)));
        locY = (cpuUnitColumn - (computerUnitDistance * Math.sign(nearTarget.distanceY)));
        cpuUnit.position = this.moveTo(locX, locY);
      } else {
        locX = (cpuUnitStr - (nearTarget.distanceX - (1 * Math.sign(nearTarget.distanceX))));
        locY = (cpuUnitColumn - (nearTarget.distanceY - (1 * Math.sign(nearTarget.distanceY))));
        cpuUnit.position = this.moveTo(locX, locY);
      }
    // Движение активного персонажа по горизонтали - Компьютер
    } else if (Math.abs(nearTarget.distanceX) === 0) {
      if (Math.abs(nearTarget.distanceY) > computerUnitDistance) {
        locY = (cpuUnitColumn - (computerUnitDistance * Math.sign(nearTarget.distanceY)));
        cpuUnit.position = this.moveTo(cpuUnitStr, locY);
      } else {
        locY = (cpuUnitColumn - (nearTarget.distanceY - (1 * Math.sign(nearTarget.distanceY))));
        cpuUnit.position = this.moveTo(cpuUnitStr, locY);
      }
    // Движение активного персонажа по вертикали - Компьютер
    } else if (Math.abs(nearTarget.distanceY) === 0) {
      if (Math.abs(nearTarget.distanceX) > computerUnitDistance) {
        locX = (cpuUnitStr - (computerUnitDistance * Math.sign(nearTarget.distanceX)));
        cpuUnit.position = this.moveTo(locX, cpuUnitColumn);
      } else {
        locX = (cpuUnitStr - (nearTarget.distanceX - (1 * Math.sign(nearTarget.distanceX))));
        cpuUnit.position = this.moveTo(locX, cpuUnitColumn);
      }
    } else if (Math.abs(nearTarget.distanceX) > Math.sign(nearTarget.distanceY)) {
      if (Math.abs(nearTarget.distanceX) > computerUnitDistance) {
        locX = (cpuUnitStr - (computerUnitDistance * Math.sign(nearTarget.distanceX)));
        cpuUnit.position = this.moveTo(locX, cpuUnitColumn);
      } else {
        locX = (cpuUnitStr - nearTarget.distanceX);
        cpuUnit.position = this.moveTo(locX, cpuUnitColumn);
      }
    } else if (Math.abs(nearTarget.distanceY) > computerUnitDistance) {
      locY = (cpuUnitColumn - (computerUnitDistance * Math.sign(nearTarget.distanceY)));
      cpuUnit.position = this.moveTo(cpuUnitStr, locY);
    } else {
      cpuUnit.position = this.moveTo(cpuUnitStr, cpuUnitColumn);
    }
  }

  checkStr(index) {
    return Math.ceil(((index - (index % this.gamePlay.boardSize)) / this.gamePlay.boardSize));
  }

  checkColumn(index) {
    return index % this.gamePlay.boardSize;
  }

  moveTo(x, y) {
    return (x * this.gamePlay.boardSize) + y;
  }

  newGame() {
    this.blockGame = false;
    const bestScore = this.getBestScrore();
    const currentGame = this.stateService.load();
    if (currentGame) {
      currentGame.bestScore = bestScore;
      this.stateService.save(GameState.from(currentGame));
    }
    this.userPositions = [];
    this.cpuPositions = [];
    this.stage = 1;
    this.score = 0;
    this.currentTheme = themes.prairie;
    this.letsPlay();
    GamePlay.showMessage('Уровень 1. Начинаем игру!');
  }

  saveGame() {
    const bestScore = this.getBestScrore();
    const currentGame = {
      score: this.score,
      bestScore,
      stage: this.stage,
      currentTheme: this.currentTheme,
      userPositions: this.userPositions,
      computerPositions: this.cpuPositions,
    };
    this.stateService.save(GameState.from(currentGame));
    GamePlay.showMessage('Текущая игра сохранена!');
  }

  loadGame() {
    try {
      const loadedGame = this.stateService.load();
      if (loadedGame) {
        this.score = loadedGame.score;
        this.stage = loadedGame.stage;
        this.currentTheme = loadedGame.currentTheme;
        this.userPositions = loadedGame.userPositions;
        this.cpuPositions = loadedGame.computerPositions;
        this.gamePlay.drawUi(this.currentTheme);
        this.gamePlay.redrawPositions([...this.userPositions, ...this.cpuPositions]);
      }
      GamePlay.showMessage('Игра загружена!');
    } catch (e) {
      console.log(e);
      GamePlay.showMessage('Не удалось загрузить игру');
      this.newGame();
    }
  }

  getBestScrore() {
    let bestScore = 0;
    try {
      const loadedGame = this.stateService.load();
      if (loadedGame) {
        bestScore = Math.max(loadedGame.bestScore, this.score);
      }
    } catch (e) {
      bestScore = this.score;
      console.log(e);
    }
    return bestScore;
  }
}
