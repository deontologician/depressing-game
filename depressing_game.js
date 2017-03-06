'use strict';

var h = maquette.h

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    this.invest = Math.min(actualState.cash, 12)
  }

  updateInvest(evt) {
    this.invest = parseInt(evt.target.value)
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

  updateCash() {
    this.cash += this.salary
    if (this.expenses > this.cash) {
      let shortfall = this.expenses - this.cash
      console.log(`There was a shortfall of $${commas(shortfall)}`)
      this.cash = 0
      if (shortfall > this.invested) {
        let debt = shortfall - this.invested
        console.log(`Had to go into debt -$${debt}`)
        this.investments = 0
        this.debt -= debt
      } else {
        this.investments -= shortfall
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

  investForm() {
    if (this.state.cash > 0) {
      return h('form', [
        h('div.form-group', [
          h('label', [`Invest $${commas(this.state.proposed.invest)}`]),
          h('input.slider', {
            type: 'range',
            min: 0,
            max: this.state.cash,
            step: 1,
            value: this.state.proposed.invest,
            oninput: this.state.proposed.updateInvest,
            bind: this.state.proposed,
          }),
        ])
      ])
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
