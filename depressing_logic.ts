import { commas } from './utils'
import { DepressingState } from './depressing_state'
import { VERY_DEPRESSING_DATA } from './depressing_data'

export interface AdvanceYearAction {
  kind: 'advance_year'
}

export interface ProposeDebtPaymentAction {
  kind: 'propose_debt_payment'
  debtAmount: number
}

export interface ProposeInvestmentAction {
  kind: 'propose_investment'
  investAmount: number
}

export interface LogAction {
  kind: 'log'
  message: string
}

export type StateAction = AdvanceYearAction
  | ProposeDebtPaymentAction
  | ProposeInvestmentAction
  | LogAction

export type Broadcaster = (sa: StateAction) => void

export class GameLogic {
  state: DepressingState

  constructor(state: DepressingState) {
    this.state = state
  }

  broadcast(sa: StateAction) {
    switch(sa.kind) {
    case 'advance_year':
      this.advanceYear()
      break
    case 'propose_investment':
      this.state.proposed.updateInvest(sa.investAmount)
      break
    case 'propose_debt_payment':
      this.state.proposed.updatePayDebt(sa.debtAmount)
      break
    case 'log':
      this.log(sa.message)
      break
    }
  }

  broadcaster(): Broadcaster {
    return this.broadcast.bind(this)
  }

  private advanceYear() {
    this.state.age += 1
    this.doInvestment()
    this.doDebt()
    this.updateCash()
    this.updateSalary()
    this.updateCapitalGains()
    this.updateExpenses()

    this.state.proposed.reset(this.state)
    this.decideIfDead()
  }

  private doInvestment() {
    if (this.state.proposed.invest > 0) {
      this.state.cash -= this.state.proposed.invest
      this.state.invested += this.state.proposed.invest
    }
  }

  private doDebt() {
    if (this.state.proposed.pay_debt > 0) {
      this.state.cash -= this.state.proposed.pay_debt
      this.state.debt += this.state.proposed.pay_debt
    }
    this.state.debt = Math.round(this.state.debt * 1.04)
  }

  private updateCash() {
    this.state.cash += this.state.salary + this.state.capital_gains
    if (this.state.expenses > this.state.cash) {
      let shortfall = this.state.expenses - this.state.cash
      this.state.cash = 0
      if (shortfall > this.state.invested) {
        let debt = shortfall - this.state.invested
        if (this.state.invested > 0) {
          this.log(`Had to go into debt -$${commas(debt)}. Savings wiped out.`)
          this.state.invested = 0
        } else {
          this.log(`Had to go into debt -$${commas(debt)}.`)
        }
        this.state.debt -= debt
      } else {
        this.log(`Not enough cash for expenses. Eating into investment principle $${commas(shortfall)}.`)
        this.state.invested -= shortfall
      }
    } else {
      this.state.cash -= this.state.expenses
    }
  }

  private updateSalary() {
    let raisePercent = 1 + Math.random() * 0.16 - 0.04
    if (raisePercent > 1.09) {
      this.log('You received a large raise')
    } else if (raisePercent < 1) {
      this.log('You were fired and got a new job at a lower salary.')
    }
    this.state.salary = Math.round(this.state.salary * raisePercent)
  }

  private updateCapitalGains() {
    this.state.capital_gains = Math.round(this.state.invested * 0.05)
  }

  private updateExpenses() {
    this.state.expenses = Math.round(
      this.state.expenses * (1 + VERY_DEPRESSING_DATA.inflation))
  }

  private decideIfDead() {
    if (Math.random() <=
        VERY_DEPRESSING_DATA.death_rates[this.state.age][this.state.sex]) {
      this.state.dead = true
    }
  }

  private log(message: string) {
    this.state.logger.record(this.state.age, message)
  }
}
