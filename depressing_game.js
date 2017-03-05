var h = maquette.h

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function determineIfDead(age) {
  return Math.random() <= 1/(120 - age)
}


function makeList(stuffs) {
  return h('ul', stuffs.map(stuff => h('li', [stuff])))
}


class DepressingState {

  constructor() {
    this.buttonText = 'Play the game'
    this.age = 18
    this.cash = 0
    this.salary = 24000
    this._howMuchToInvest = 0
    this.invested = 0
    this.expenses = 0
    this.dead = false
  }

  updateInvest(evt) {
    this._howMuchToInvest = evt.target.value
  }

  doRound() {
    this.age += 1
    this.investments = Math.round(this.investments *= 1.05)
    let investAmount = Math.max(0, this._howMuchToInvest)
    this.cash -= investAmount
    this.invested += investAmount
    this.cash += this.salary
    this._howMuchToInvest = Math.round(this.cash / 2)
    this.salary = Math.round(this.salary * 1.02)
    if (determineIfDead(this.age)) {
      this.dead = true
    }
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
          h('label', [`Invest $${commas(this.state._howMuchToInvest)}`]),
          h('input.slider', {
            type: 'range',
            min: 0,
            max: this.state.cash,
            step: 1,
            value: this.state._howMuchToInvest,
            oninput: this.state.updateInvest,
            onchange: this.state.updateInvest,
            bind: this.state,
          }),
        ])
      ])
    }
  }

  render() {
    return h('div', [
      h('p', [this.bigtext()]),
      makeList([
        h('div', [`Age: ${this.state.age}`]),
        h('div', [`Cash: $${commas(this.state.cash)}`]),
        h('div', [`Salary: $${commas(this.state.salary)}`]),
        h('div', [`Investments: $${commas(this.state.invested)}`]),
      ]),
      this.investForm(),
      (this.state.dead) ? h('b', ['You died.']) : this.button(),
    ])
  }
}
