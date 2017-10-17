import { satsub } from './utils'
import { VERY_DEPRESSING_DATA } from './depressing_data'

export class DepressingState {
  age: number = 18
  sex: 'male'|'female'
  cash: number
  salary: number
  capital_gains: number
  invested: number
  debt: number
  expenses: number
  dead: boolean
  logger: DepressingLog
  proposed: ProposedState

  constructor() {
    this.sex = Math.random() > 0.5 ? 'male': 'female'
    this.cash = 0
    this.salary = 28458
    this.capital_gains = 0
    this.invested = 0
    this.debt = 0
    this.expenses = VERY_DEPRESSING_DATA.cost_of_living
    this.dead = false
    this.logger = new DepressingLog()
    this.proposed = new ProposedState(this)
  }
}

export class ProposedState {

  cash: number
  debt: number
  pay_debt: number
  invest: number

  constructor(actualState:DepressingState) {
    this.reset(actualState)
  }

  reset(actualState:DepressingState) {
    this.cash = actualState.cash
    this.debt = actualState.debt
    this.pay_debt = Math.min(this.cash, 12)
    this.invest = Math.min(12, satsub(this.cash, this.pay_debt))
  }
}


export class DepressingLog {
  _log: Array<{m: string, id: number, age: number}>

  constructor() {
    this._log = []
  }

  record(age:number, message:string) {
    this._log.unshift({m: message, id: Math.random(), age})
  }

  allLogs() {
    return this._log
  }
}
