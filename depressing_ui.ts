import { h,
         VNode,
         VNodeChild,
         VNodeProperties } from './third-party/maquette'
import { commas } from './utils'
import { DepressingState, ProposedState } from './depressing_state'

export abstract class Component<State, UIState> {
  state: State
  uistate: UIState
  constructor(state: State) {
    this.state = state
    this.uistate = this.initUIState()
  }
  abstract render(): VNodeChild
  abstract initUIState(): UIState
}

export abstract class SimpleComponent<State> extends Component<State, null> {
  initUIState(): null { return null }
}

export abstract class ConstComponent extends SimpleComponent<null> {}

export class FullGameComponent extends SimpleComponent<DepressingState> {
  state: DepressingState
  outputList: OutputListComponent
  inputForm: InputFormComponent
  log: LogComponent

  constructor(state: DepressingState) {
    super(state)
    this.outputList = new OutputListComponent(this.state)
    this.inputForm = new InputFormComponent(this.state)
    this.log = new LogComponent(this.state)
  }

  render(): VNode {
    return h('div.tile.is-ancestor', {key: this}, [
      h('div.tile.is-parent',
        h('div.tile.is-child', this.outputList.render())),
      h('div.tile.is-parent',
        h('div.tile.is-child', this.inputForm.render())),
      h('div.tile.is-parent',
        h('div.tile.is-child', this.log.render())),
    ])
  }
}

export class OutputListComponent extends SimpleComponent<DepressingState> {
  render(): VNode {
    return h('ul.displays', {key: this}, [
      this.sex(),
      this.age(),
      this.cash(),
      this.expenses(),
      this.salary(),
      this.capitalGains(),
      this.investments(),
      this.debt(),
    ])
  }

  sex() { return this.makeli('Sex', this.state.sex) }
  age() { return this.makeli('Age', this.state.age) }
  cash() { return this.makeli$('Cash', this.state.cash) }
  expenses() { return this.makeli$('Expenses', this.state.expenses) }
  salary() { return this.makeli$('Salary', this.state.salary) }

  capitalGains() {
    if (this.state.capital_gains > 0) {
      return this.makeli$('Capital gains', this.state.capital_gains)
    }
  }

  investments() {
    if (this.state.invested > 0) {
      return this.makeli$('Investments', this.state.invested)
    }
  }

  debt() {
    if (this.state.debt < 0) {
      return this.makeli$('Debt', this.state.debt)
    }
  }

  private makeli$(title:string, value:number|string): VNode {
    return h('li', {key: title}, [`${title}: $${commas(value)}`])
  }

  private makeli(title:string, value:number|string): VNode {
    return h('li', {key: title}, [`${title}: ${commas(value)}`])
  }
}

export class InputFormComponent extends SimpleComponent<DepressingState> {
  investForm: InvestFormComponent
  buttonClick: () => void


  constructor(state: DepressingState) {
    super(state)
    this.investForm = new InvestFormComponent(this.state)
    this.buttonClick = () => this.state.doRound()
  }
  render(): VNode {
    if (this.state.dead) {
      return h('p',
               h('b', 'You died.'))
    } else {
      return h('p',
        h('a.button.is-danger',
          {onclick: this.buttonClick}, 'Play the game'),
        this.investForm.render(),
      )
    }
  }
}

export class InvestFormComponent extends SimpleComponent<DepressingState> {
  render(): VNode {
    return h('form',
             h('div.form-group',
               this.investSlider(),
               this.debtSlider(),
             ))
  }

  investSlider(): VNode | undefined {
    if (this.state.cash > 0) {
      return h('label', {key: 'label-invest'},
               `Invest $${commas(this.state.proposed.invest)}`,
               this.rangeSlider(
                 this.state.proposed,
                 'invest',
                 this.state.proposed.updateInvest,
                 this.state.cash))
    }
  }

  debtSlider(): VNode | undefined {
    if (this.state.cash > 0 && this.state.debt < 0) {
      return h('label', {key: 'label-pay-debt'},
               `Pay debt $${commas(this.state.proposed.pay_debt)}`,
               this.rangeSlider(
                 this.state.proposed,
                 'pay_debt',
                 this.state.proposed.updatePayDebt,
                 Math.min(-this.state.debt, this.state.cash)))
    }
  }

  private rangeSlider(
    state: ProposedState,
    prop: keyof ProposedState,
    updateFunc: (evt: Event) => void,
    max: number,
  ): VNode {
    return h('input.slider', {
      type: 'range',
      min: 0,
      max,
      step: 1,
      key: prop,
      value: state[prop].toString(),
      oninput: updateFunc,
      bind: state,
    })
  }

}

export class LogComponent extends SimpleComponent<DepressingState> {
  render(): VNode {
    return h('div.eventlog', this.state.getLogs()
             .map(msg => h('p', {key: msg.id},
                           h('b', `Age ${msg.age}`),
                           msg.m)))
  }
}
