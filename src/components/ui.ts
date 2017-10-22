import { Person } from '../logic'
import { b, VNode} from '@cycle/dom'
import './style.css'

export function rootElem(person: Person): VNode  {
  return b(`${person.name}`)
}
