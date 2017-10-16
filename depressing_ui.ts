import { h,
         VNode,
         VNodeChild } from './third-party/maquette'
import { commas, unwrapInt } from './utils'
import { DepressingState, ProposedState } from './depressing_state'
import { Broadcaster } from './depressing_logic'

export abstract class Component<State, UIState> {
  state: State
  broadcast: Broadcaster
  uistate: UIState

  constructor(state: State, broadcast: Broadcaster) {
    this.state = state
    this.broadcast = broadcast
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

  constructor(state: DepressingState, broadcast: Broadcaster) {
    super(state, broadcast)
    this.outputList = new OutputListComponent(this.state, broadcast)
    this.inputForm = new InputFormComponent(this.state, broadcast)
    this.log = new LogComponent(this.state, broadcast)
  }

  render(): VNode {
    return h('div.tile.is-ancestor', {key: this}, [
      // The "is-X" classes have to sum to 12
      h('div.tile.is-parent.is-3',
        h('div.tile.is-child.box', this.outputList.render())),
      h('div.tile.is-parent.is-3',
        h('div.tile.is-child.box', this.inputForm.render())),
      h('div.tile.is-parent.is-6',
        h('div.tile.is-child.box', this.log.render())),
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

  capitalGains(): VNodeChild {
    if (this.state.capital_gains <= 0) { return }
    return this.makeli$('Capital gains', this.state.capital_gains)
  }

  investments(): VNodeChild {
    if (this.state.invested <= 0) { return }
    return this.makeli$('Investments', this.state.invested)
  }

  debt(): VNodeChild {
    if (this.state.debt >= 0) { return }
    return this.makeli$('Debt', this.state.debt)
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


  constructor(state: DepressingState, broadcast: Broadcaster) {
    super(state, broadcast)
    this.investForm = new InvestFormComponent(this.state, broadcast)
    this.buttonClick = () => {
      broadcast({kind: 'advance_year'})
    }
    //this.buttonClick = () => this.state.doRound()
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
  investUpdate: (ev: Event) => void
  debtUpdate: (ev: Event) => void

  constructor(state: DepressingState, broadcast: Broadcaster) {
    super(state, broadcast)
    this.investUpdate = unwrapInt(investAmount => broadcast({
      kind: 'propose_investment',
      investAmount,
    }))

    this.debtUpdate = unwrapInt(debtAmount => broadcast({
      kind: 'propose_debt_payment',
      debtAmount
    }))
  }

  render(): VNode {
    return h('form',
             h('div.form-group',
               this.investSlider(),
               this.debtSlider(),
             ))
  }

  investSlider(): VNodeChild {
    if (this.state.cash <= 0) { return }
    return h('div.field',
             h('label', {key: 'label-invest'},
               `Invest $${commas(this.state.proposed.invest)}`,
               this.rangeSlider(
                 this.state.proposed,
                 'invest',
                 this.investUpdate,
                 this.state.cash)))
  }

  debtSlider(): VNodeChild {
    if (this.state.cash <= 0 || this.state.debt >= 0) { return }
    return h('label', {key: 'label-pay-debt'},
             `Pay debt $${commas(this.state.proposed.pay_debt)}`,
             this.rangeSlider(
               this.state.proposed,
               'pay_debt',
               this.debtUpdate,
               Math.min(-this.state.debt, this.state.cash)))
  }

  private rangeSlider(
    state: ProposedState,
    prop: keyof ProposedState,
    updateFunc: (evt: Event) => void,
    max: number,
  ): VNode {
    return h('div.control',
             h('input.slider', {
               type: 'range',
               min: 0,
               max,
               step: 1,
               key: prop,
               value: state[prop].toString(),
               oninput: updateFunc,
             }))
  }

}

export class LogComponent extends SimpleComponent<DepressingState> {
  render(): VNode {
    return h('div.eventlog', this.state.getLogs()
             .map(msg => h('p', {key: msg.id},
                           h('b', `Age ${msg.age} `),
                           msg.m)))
  }
}
