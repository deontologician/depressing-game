'use strict';

var h = maquette.h

function satsub(a, b) {
  return Math.max(a-b, 0)
}

class DepressingLog {
  constructor() {
    this._log = []
  }

  record(age, message) {
    this._log.unshift({m: message, id: Math.random(), age})
  }

  allLogs() {
    return this._log
  }
}

class ProposedState {
  constructor(actualState) {
    this.reset(actualState)
  }

  reset(actualState) {
    this.cash = actualState.cash
    this.debt = actualState.debt
    this.pay_debt = Math.min(this.cash, 12)
    this.invest = Math.min(12, satsub(this.cash, this.pay_debt))
  }

  updateInvest(evt) {
    let amount = parseInt(evt.target.value)
    this.invest = amount
    let ready_cash = this.cash - this.pay_debt
    if (amount > ready_cash) {
      this.pay_debt += ready_cash - amount
    }
  }

  updatePayDebt(evt) {
    let amount = parseInt(evt.target.value)
    this.pay_debt = amount
    let ready_cash = this.cash - this.invest
    if (amount > ready_cash) {
      this.invest += ready_cash - amount
    }
  }
}


class DepressingState {

  constructor() {
    this.buttonText = 'Play the game'
    this.age = 18
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

  log(message) {
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
          this.log(`Had to go into debt -$${UI.commas(debt)}. Savings wiped out.`)
          this.invested = 0
        } else {
          this.log(`Had to go into debt -$${UI.commas(debt)}.`)
        }
        this.debt -= debt
      } else {
        this.log(`Not enough cash for expenses. Eating into investment principle $${UI.commas(shortfall)}.`)
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

class DepressingGame {
  constructor() {
    this.data = VERY_DEPRESSING_DATA
    this.state = new DepressingState()
  }

  bigtext() {
    return this.data.preamble
  }

  button() {
    return UI.successButton({
      onclick: this.state.doRound,
      bind: this.state,
    }, [this.state.buttonText])
  }

  investForm() {
    if (this.state.cash > 0) {
      let sliders = [
        UI.slider$({
          name: 'Invest',
          prop: 'invest',
          update: this.state.proposed.updateInvest,
          bind: this.state.proposed,
          max: this.state.cash,
        })
      ]

      if (this.state.debt < 0) {
        sliders.push(
          UI.slider$({
            name: 'Pay debt',
            prop: 'pay_debt',
            update: this.state.proposed.updatePayDebt,
            bind: this.state.proposed,
            max: Math.min(-this.state.debt, this.state.cash),
          })
        )
      }

      return UI.sliderForm(sliders)
    } else {
      return ''
    }
  }

  inputForm() {
    if (!this.state.dead) {
      return UI.p([
        this.investForm(),
        this.button(),
      ])
    } else {
      return UI.b('You died.')
    }
  }

  outputList() {
    let displays = [
      UI.keyvalLi('Sex', this.state.sex),
      UI.keyvalLi('Age', this.state.age),
      UI.keyvalLi$('Cash', this.state.cash),
      UI.keyvalLi$('Expenses', this.state.expenses),
      UI.keyvalLi$('Salary', this.state.salary),
    ]
    if (this.state.capital_gains > 0) {
      displays.push(UI.keyvalLi$('Capital gains', this.state.capital_gains))
    }
    if (this.state.invested > 0) {
      displays.push(UI.keyvalLi$('Investments', this.state.invested))
    }
    if (this.state.debt < 0) {
      displays.push(UI.keyvalLi$('Debt', this.state.debt))
    }

    return UI.ul(displays)
  }

  showLog() {
    let logs = this.state.getLogs()
        .map((msg) => UI.p({key: msg.id}, [
          UI.b(`Age ${msg.age}: `),
          msg.m
        ]))
    return UI.div(logs)
  }

  render() {
    return UI.div([
      UI.p([this.bigtext()]),
      this.outputList(),
      this.inputForm(),
      this.showLog(),
    ])
  }
}
