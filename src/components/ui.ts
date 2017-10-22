import { Person } from '../logic'
import { section, div, span, h2, VNode, thunk } from '@cycle/dom'
import './style.css'
import './bulma.css'

export function rootElem(person: Person): VNode  {
  return section('.section', [
    div('.content',
        h2('.title', 'A Game')),
    div('.tile.is-ancestor',
        div('#game.box.tile.is-parent', [
          thunk('span.fooey', personName, [person.name])
        ]))
  ])
}

function personName(name: string): VNode {
  return span([`This is a person named ${name}`])
}
