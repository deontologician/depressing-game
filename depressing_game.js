var h = maquette.h

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function determineIfDead(age) {
  return Math.random() <= 1/(120 - age)
}


class DepressingState {

  constructor() {
    this.buttonText = 'Play the game'
    this.age = 18
    this.dollars = 0
    this.salary = 24000
    this.dead = false
  }

  doRound() {
    this.age += 1
    this.dollars += this.salary
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

  makeList(stuffs) {
    return h('ul', stuffs.map(stuff => h('li', [stuff])))
  }

  render() {
    return h('div', [
      h('p', [this.bigtext()]),
      this.makeList([
        h('div', [`Age: ${this.state.age}`]),
        h('div', [`Dollars: $${numberWithCommas(this.state.dollars)}`]),
        h('div', [`Salary: $${numberWithCommas(this.state.salary)}`]),
      ]),
      (this.state.dead) ? h('b', ['You died.']) : this.button(),
    ])
  }
}
