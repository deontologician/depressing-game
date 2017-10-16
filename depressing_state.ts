import { satsub, commas } from './utils'
import { VeryDepressingData, VERY_DEPRESSING_DATA } from './depressing_data'

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

  log(message: string) {
    this.logger.record(this.age, message)
  }

  getLogs() {
    return this.logger.allLogs()
  }

  decideIfDead() {
    if (Math.random() <=
        VERY_DEPRESSING_DATA.death_rates[this.age][this.sex]) {
      this.dead = true
    }
  }

  updateSalary() {
    let raisePercent = 1 + Math.random() * 0.16 - 0.04
    if (raisePercent > 1.09) {
      this.log('You received a large raise')
    } else if (raisePercent < 1) {
      this.log('You were fired and got a new job at a lower salary.')
    }
    this.salary = Math.round(this.salary * raisePercent)
  }

  updateCapitalGains() {
    this.capital_gains = Math.round(this.invested * 0.05)
  }

  doInvestment() {
    if (this.proposed.invest > 0) {
      this.cash -= this.proposed.invest
      this.invested += this.proposed.invest
    }
  }

  doDebt() {
    if (this.proposed.pay_debt > 0) {
      this.cash -= this.proposed.pay_debt
      this.debt += this.proposed.pay_debt
    }
    this.debt = Math.round(this.debt * 1.04)
  }

  updateCash() {
    this.cash += this.salary + this.capital_gains
    if (this.expenses > this.cash) {
      let shortfall = this.expenses - this.cash
      this.cash = 0
      if (shortfall > this.invested) {
        let debt = shortfall - this.invested
        if (this.invested > 0) {
          this.log(`Had to go into debt -$${commas(debt)}. Savings wiped out.`)
          this.invested = 0
        } else {
          this.log(`Had to go into debt -$${commas(debt)}.`)
        }
        this.debt -= debt
      } else {
        this.log(`Not enough cash for expenses. Eating into investment principle $${commas(shortfall)}.`)
        this.invested -= shortfall
      }
    } else {
      this.cash -= this.expenses
    }
  }

  updateExpenses() {
    this.expenses = Math.round(this.expenses * (1 + VERY_DEPRESSING_DATA.inflation))
  }

  doRound() {
    this.age += 1
    this.doInvestment()
    this.doDebt()
    this.updateCash()
    this.updateSalary()
    this.updateCapitalGains()
    this.updateExpenses()

    this.proposed.reset(this)
    this.decideIfDead()
  }
}


interface ProposedStateFields {
  cash: number
  debt: number
  pay_debt: number
  invest: number
}

interface ProposedStateUpdates {
  updateInvest: (evt:Event)=>void,
  updatePayDebt: (evt:Event)=>void,
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

  updateInvest(evt: Event) {
    let target = evt.target
    if (!(target instanceof HTMLInputElement)) {
      return
    }
    let amount = parseInt(target.value)
    this.invest = amount
    let ready_cash = this.cash - this.pay_debt
    if (amount > ready_cash) {
      this.pay_debt += ready_cash - amount
    }
  }

  updatePayDebt(evt:Event) {
    let target = evt.target
    if (!(target instanceof HTMLInputElement)) {
      return
    }
    let amount = parseInt(target.value)
    this.pay_debt = amount
    let ready_cash = this.cash - this.invest
    if (amount > ready_cash) {
      this.invest += ready_cash - amount
    }
  }
}


class DepressingLog {
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
