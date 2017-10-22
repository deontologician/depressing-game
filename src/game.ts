import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import xs from 'xstream'

import { rootElem } from './components/ui'
import { Person } from './logic'


function main() {
  return {
    DOM: xs.periodic(1000)
      .map(i => rootElem(new Person(`Jim-${i}`)))
  }
}

const drivers = {
  DOM: makeDOMDriver('body')
}

run(main, drivers)
