import { commas } from '../utils'
import './style.css'
import './bulma.css'

import {
  GameState,
  Person,
  CreditAccounts,
  InvestmentAccounts,
} from '../logic'

import {
  VNode,
  section, div, h2, ul, li
} from '@cycle/dom'

export function rootElem(gs: GameState): VNode  {
  return section('.section', [
    div('.content',
        h2('.title', 'A Game')),
    div('.tile.is-ancestor',
        div('#game.box.tile.is-parent',
            fullGameComponent(gs)))
  ])
}

function fullGameComponent(gs: GameState): Array<VNode> {
  return [
    div('.tile.is-parent.is-3',
        div('.tile.is-child.box', statsList(gs.person))),
    // div('.tile.is-parent.is-3',
    //     div('.tile.is-child.box', inputForm(gs.person.currentProposal))),
    // div('.tile.is-parent.is-6',
    //     div('.tile.is-child.box', logWindow(gs.person.logs))),
  ]
}

function statsList(person: Person): VNode {
  return ul('.displays', [
    li({key: 'Sex'}, `Sex: ${person.sex}`),
    statItem('Age', person.age),
    statItem('Happiness', person.happiness),
    statItem('Suffering', person.suffering),
    statMoneyItem('Cash', person.cash.balance),
    //statMoneyItem('Expenses', person.expenses),
    statMoneyItem('Salary', person.job.salary),
    investmentStats(person.investments),
    debtStats(person.debts),
  ])
}


function statItem(title:string, value:number|string): VNode {
  return li({key: title}, [`${title}: ${commas(value)}`])
}

function statMoneyItem(title:string, value:number|string): VNode {
  return li({key: title}, [`${title}: $${commas(value)}`])
}

function investmentStats(invs: InvestmentAccounts): VNode | null {
  return (invs.total() > 0) ? statMoneyItem('Investments', invs.total()) : null
}

function debtStats(debts: CreditAccounts): VNode | null {
  return (debts.total() < 0) ? statMoneyItem('Debts', debts.total()) : null
}
