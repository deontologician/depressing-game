import { VeryDepressingData, VERY_DEPRESSING_DATA } from './depressing_data'
import { FullGameComponent } from './depressing_ui'
import { DepressingState } from './depressing_state'
import { GameLogic, Broadcaster } from './depressing_logic'

import { createProjector } from './third-party/maquette'

import { Game } from './new_hotness'

declare global {
  interface Window { game: DepressingGame; }
}

class DepressingGame {
  data: VeryDepressingData
  state: DepressingState
  gameLogic: GameLogic
  broadcaster: Broadcaster
  fullGame: FullGameComponent

  constructor() {
    this.data = VERY_DEPRESSING_DATA
    this.state = new DepressingState()
    this.gameLogic = new GameLogic(this.state)
    this.broadcaster = this.gameLogic.broadcaster()
    this.fullGame = new FullGameComponent(this.state, this.broadcaster)
  }

  render() {
    return this.fullGame.render()
  }
}

// Initialize
export function initialize() {
  let projector = createProjector()
  let rootElem = document.getElementById('game')
  let depressingGame = new DepressingGame()
  if (rootElem !== null) {
    projector.append(rootElem, () => depressingGame.render())
  }

  let newProjector = createProjector()
  let newRootElem = document.getElementById('new-game')
  let newGame = new Game()
  if (newRootElem !== null) {
    newProjector.append(newRootElem, () => newGame.render())
  }
  window.game = depressingGame
}
