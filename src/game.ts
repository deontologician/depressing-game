import { run, FantasySinks } from '@cycle/run'
import { makeDOMDriver, DOMSource, VNode } from '@cycle/dom'
import xs from 'xstream'
import { Stream } from 'xstream'

import { rootElem } from './components/ui'
import { GameState } from './logic'
import { unwrapInt } from './utils'

type Sources = {DOM: DOMSource}
type Sinks = FantasySinks<Sources>

function main(sources: Sources): Sinks {
  const model$ = model()
  return {
    DOM: view(model$)
  }
}

type Actions = {
  advanceYear$: Stream<boolean>
}

function intent(domSource: DOMSource): Actions {
  return {
    advanceYear$: domSource.select('.play-game').events('click')
      .map(ev => true)
  }
}

function model(actions: Actions): Stream<GameState> {
  return xs.of(new GameState())
}

function view(states$: Stream<GameState>): Stream<VNode> {
  return states$.map(rootElem)
}

run(main, {
  DOM: makeDOMDriver('body')
})
