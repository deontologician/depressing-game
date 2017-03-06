var h = maquette.h

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function makeList(stuffs) {
  return h('ul', stuffs.map(stuff => h('li', [stuff])))
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
    this.cash = 0
    this.salary = 24000
    this.invested = 0
    this.expenses = 0
    this.dead = false
    this.proposed = new ProposedState(this)
  }

  updateSalary() {
    let raisePercent = 1 + Math.random() * 0.12 - 0.05
    this.salary = Math.round(this.salary * raisePercent)
  }

  decideIfDead() {
    if (Math.random() <= 1/(120 - this.age)) {
      this.dead = true
    }
  }

  doInvestment() {
    this.invested = Math.round(this.invested * 1.05)
    this.cash -= this.proposed.invest
    this.invested += this.proposed.invest
  }

  doRound() {
    this.age += 1
    this.doInvestment()
    this.cash += this.salary
    this.updateSalary()

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
    return makeList([
      h('div', [`Age: ${this.state.age}`]),
      h('div', [`Cash: $${commas(this.state.cash)}`]),
      h('div', [`Salary: $${commas(this.state.salary)}`]),
      h('div', [`Investments: $${commas(this.state.invested)}`]),
    ])
  }

  render() {
    return h('div', [
      h('p', [this.bigtext()]),
      this.outputList(),
      this.inputForm(),
    ])
  }
}
