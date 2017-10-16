import { VeryDepressingData, VERY_DEPRESSING_DATA } from './depressing_data'
import { FullGameComponent } from './depressing_ui'
import { DepressingState } from './depressing_state'

import { h, createProjector } from './third-party/maquette'

declare global {
  interface Window { game: DepressingGame; }
}

class DepressingGame {
  data: VeryDepressingData
  state: DepressingState
  fullGame: FullGameComponent

  constructor() {
    this.data = VERY_DEPRESSING_DATA
    this.state = new DepressingState()
    this.fullGame= new FullGameComponent(this.state)
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
  window.game = depressingGame
}
