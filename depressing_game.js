'use strict';

var h = maquette.h

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function satsub(a, b) {
  return Math.max(a-b, 0)
}


function makeli$(title, value) {
  return h('li', {key: title}, [`${title}: $${commas(value)}`])
}

function makeli(title, value) {
  return h('li', {key: title}, [`${title}: ${commas(value)}`])
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
    this.invested = 0
    this.debt = 0
    this.expenses = VERY_DEPRESSING_DATA.cost_of_living
    this.dead = false
    this.proposed = new ProposedState(this)
  }

  updateSalary() {
    let raisePercent = 1 + Math.random() * 0.15 - 0.05
    this.salary = Math.round(this.salary * raisePercent)
  }

  decideIfDead() {
    if (Math.random() <=
        VERY_DEPRESSING_DATA.death_rates[this.age][this.sex]) {
      this.dead = true
    }
  }

  doInvestment() {
    this.invested = Math.round(this.invested * 1.05)
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
    this.cash += this.salary
    if (this.expenses > this.cash) {
      let shortfall = this.expenses - this.cash
      console.log(`There was a shortfall of $${commas(shortfall)}`)
      this.cash = 0
      if (shortfall > this.invested) {
        let debt = shortfall - this.invested
        console.log(`Had to go into debt -$${debt}`)
        this.invested = 0
        this.debt -= debt
      } else {
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
    return h('a.btn.btn-large.btn-success', {
      onclick: this.state.doRound,
      bind: this.state,
    }, [this.state.buttonText])
  }

  slider(prop, updateFunc, max) {
    return h('input.slider', {
      type: 'range',
      min: 0,
      max: max,
      step: 1,
      key: prop,
      value: this.state.proposed[prop],
      oninput: this.state.proposed[updateFunc],
      bind: this.state.proposed,
    })
  }

  investForm() {
    if (this.state.cash > 0) {
      let sliders = [
        h('label', [`Invest $${commas(this.state.proposed.invest)}`]),
        this.slider('invest', 'updateInvest', this.state.cash),
      ]

      if (this.state.debt < 0) {
        sliders.push(
          h('label', [`Pay debt $${commas(this.state.proposed.pay_debt)}`]))
        sliders.push(
          this.slider('pay_debt', 'updatePayDebt',
                      Math.min(-this.state.debt, this.state.cash)))
      }

      return h('form', [h('div.form-group', sliders)])
    } else {
      return ''
    }
  }

  inputForm() {
    if (!this.state.dead) {
      return h('p', [
        this.investForm(),
        this.button(),
      ])
    } else {
      return h('b', ['You died.'])
    }
  }



  outputList() {
    let displays = [
      makeli('Sex', this.state.sex),
      makeli('Age', this.state.age),
      makeli$('Cash', this.state.cash),
      makeli$('Salary', this.state.salary),
      makeli$('Expenses', this.state.expenses),
    ]
    if (this.state.invested > 0) {
      displays.push(makeli$('Investments', this.state.invested))
    }
    if (this.state.debt < 0) {
      displays.push(makeli$('Debt', this.state.debt))
    }

    return h('ul', displays)
  }

  render() {
    return h('div', [
      h('p', [this.bigtext()]),
      this.outputList(),
      this.inputForm(),
    ])
  }
}
