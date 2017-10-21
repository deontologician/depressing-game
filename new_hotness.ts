// This file is intending to restructure depressing_data so that it is
// more generalizable to more account types and more people.
import { DepressingLog } from './depressing_state'
import { commas } from './utils'
import { VERY_DEPRESSING_DATA } from './depressing_data'
import { rootElem } from './new_hotness_ui'
import { VNode } from './third-party/maquette'

export class Game {
  private person: Person

  constructor() {
    this.person = new Person('Jim')
  }

  render(): VNode {
    rootElem(this.person)
  }
}

export class Person {
  public readonly name: string
  public readonly sex: 'male' | 'female'

  public cash: Account = new CashAccount()
  public investments: Array<InvestmentAccount> = []
  public debts: Array<CreditAccount> = []
  public dead: boolean = false
  public age: number = 18
  public job: Job = new Job(this, VERY_DEPRESSING_DATA.cost_of_living)

  public hedons: number = 0
  public dolors: number = 0

  private logger: DepressingLog = new DepressingLog()

  constructor(name: string) {
    this.name = name
    this.logger = new DepressingLog()
  }

  log(message: string) {
    this.logger.record(this.age, message)
  }

  addInvestmentAccount(acct: InvestmentAccount) {
    this.investments.push(acct)
  }

  addCreditAccount(acct: CreditAccount) {
    this.debts.push(acct)
  }
}

export abstract class Account {
  public readonly name: string
  public readonly minBalance: number
  public readonly interestRate: number

  private _balance: number
  private _maxBalance: number
  private proposalFor: Account | null // Used to distinguish proposals

  constructor(opts: {
    name: string,
    startingBalance?: number,
    minBalance?: number,
    maxBalance?: number,
    interestRate?: number,
  }) {
    this.name = opts.name
    this._balance = opts.startingBalance || 0
    this.minBalance = opts.minBalance || 0
    this._maxBalance = opts.maxBalance || Infinity
    this.interestRate = opts.interestRate || 0
    this.proposalFor = null
  }

  get balance(): number {
    return this._balance
  }

  get maxBalance(): number {
    return this._maxBalance
  }

  set maxBalance(val: number) {
    if (this.proposalFor === null) {
      throw new Error(`Can't change maxBalance on a real account`)
    }
    this._maxBalance = val
  }

  static transfer(
    amount: number,
    {source, target}: {source: Account, target: Account}) {
    if (Math.round(amount) !== amount) {
      throw new Error(`Amount to be transfered must be an integer. \
                       Got $${amount}`)
    }
    source.validateWithdrawal(amount)
    target.validateDeposit(amount)
    source.withdraw(amount)
    target.deposit(amount)
  }

  protected validateDeposit(amount: number) {
    if (amount < 0) {
      throw new Error(`Can't deposit a negative amount to an account`)
    }
    if (this.balance + amount > this.maxBalance) {
      throw new Error(
        `Can't deposit $${amount} to ${this.name}, it goes over the \
         max balance of $${this.maxBalance}`)
    }
  }

  protected validateWithdrawal(amount: number) {
    if (amount < 0) {
      throw new Error(`Can't withdraw a negative amount from an account`)
    }
    if (this.balance - amount < this.minBalance) {
      throw new Error(
        `Can't withdraw $${amount} from ${this.name}, it drops below the \
         minimum balance of $${this.minBalance}`)
    }
  }

  private deposit(amount: number) {
    this.validateDeposit(amount)
    this._balance += amount
  }

  private withdraw(amount: number) {
    this.validateWithdrawal(amount)
    this._balance -= amount
  }

  makeProposal() {
    // Escape from type safety
    let proposed = new (<any>this.constructor(this))
    proposed.proposalFor = this
    return proposed
  }
}

export class CashAccount extends Account {
  constructor() {
    super({name: 'cash'})
  }
}

export class CreditAccount extends Account {
  public readonly canDecrease: boolean

  constructor({name, minBalance, interestRate, canDecrease}: {
    name: string,
    minBalance: number,
    interestRate: number,
    canDecrease: boolean,
  }) {
    super({maxBalance: 0, name, minBalance, interestRate})
    this.canDecrease = canDecrease
  }

  availableCredit(): number {
    if (!this.canDecrease) {
      return 0
    } else {
      return this.balance - this.minBalance
    }
  }

  payoffAmount(): number {
    return this.maxBalance - this.balance
  }

  protected validateWithdrawal(amount: number) {
    super.validateWithdrawal(amount)
    if (!this.canDecrease) {
      throw new Error(`Can't withdraw from credit account ${this.name}`)
    }
  }
}

export class InvestmentAccount extends Account {
  constructor(opts: { name: string, interestRate: number }) {
    super(opts)
  }
}

export class Job {
  public salary: number
  public jobStability: number

  private worker: Person

  constructor(worker: Person, salary: number) {
    this.salary = salary
    this.worker = worker
    this.jobStability = 0.90
  }

  salaryReview() {
    if (Math.random() > this.jobStability) {
      let lossPercent = 1 - Math.random() * 0.04
      this.salary = Math.round(this.salary * lossPercent)
      this.worker.log(`You were fired and got a new job at a lower salary: $${commas(this.salary)}`)
    } else {
      let raisePercent = 1 + Math.random() * 0.14
      this.salary = Math.round(this.salary * raisePercent)
      this.worker.log(`You received a large raise to: $${commas(this.salary)}`)
    }
  }
}

export class Item {
  name: string
  price: number
}

export class SpendingProposal {
  public purchases: Array<Item> = []
  public cash: CashAccount
  public investments: Array<InvestmentAccount>
  public debts: Array<CreditAccount>

  private readonly startingTotal: number

  constructor(person: Person) {
    this.cash = person.cash.makeProposal()
    this.investments = person.investments.map(i => i.makeProposal())
    this.debts = person.debts.map(d => d.makeProposal())

    this.startingTotal = this.proposalSum()
  }

  currentDebt(): number {
    return this.debts.reduce((total, d) => total + d.balance, 0)
  }

  availableCredit(): number {
    return this.debts.reduce((total, d) => total + d.availableCredit(), 0)
  }

  totalInvestments(): number {
    return this.investments.reduce((total, i) => total + i.balance, 0)
  }

  purchasesPrice(): number {
    return -this.purchases.reduce((total, i) => total + i.price, 0)
  }

  proposalSum(): number {
    return this.availableCredit() +
      this.currentDebt() +
      this.cash.balance +
      this.totalInvestments() +
      this.purchasesPrice()
  }

  sanityCheck() {
    this.proposalSum() === this.startingTotal
  }

  private getDebtByName(name: string): CreditAccount {
    let results = this.debts.filter(d => d.name === name)
    if(results.length === 0) {
      throw new Error(`Didn't find debt named ${name}`)
    }
    return results[0]
  }

  private getInvestmentByName(name: string): InvestmentAccount {
    let results = this.investments.filter(i => i.name === name)
    if (results.length === 0) {
      throw new Error(`Didn't find investment named ${name}`)
    }
    return results[0]
  }

  setDebt(name: string, newBalance: number) {
    const debt = this.getDebtByName(name)
    if (newBalance < debt.balance) { // Ok we're trying to take out credit
      // How much do we want to take out?
      const wantToTakeOut = debt.balance - newBalance
      // But how much are we actually allowed to take out?
      const canTakeOut = debt.availableCredit()
      // We're only taking out what's available or if we want less
      // than that, the entire amount we want
      const goingToTakeOut = Math.min(canTakeOut, wantToTakeOut)
      // If we can't take anything out, we're done
      if (canTakeOut > 0) {
        Account.transfer(goingToTakeOut, {source: debt, target: this.cash})
      }
    } else { // Ok here we're paying off a debt
      // How much are we trying to pay?
      const wantToPay = newBalance - debt.balance
      // How much do we need to pay?
      const needToPay = debt.payoffAmount()
      // But how much can we actually pay?
      const canPay = this.cash.balance
      // Only the lesser of what we want to and need to
      const goingToPay = Math.min(needToPay, wantToPay, canPay)
      // Only pay if we need to
      if (needToPay > 0) {
        Account.transfer(goingToPay, {source: this.cash, target: debt})
      }
    }
  }

  setInvestment(name: string, newBalance: number) {
    const inv = this.getInvestmentByName(name)
    if (newBalance > inv.balance) {
      const desiredDeposit = newBalance - inv.balance
      const goingToDeposit = Math.min(this.cash.balance, desiredDeposit)
      if (goingToDeposit > 0) {
        Account.transfer(goingToDeposit, {source: this.cash, target: inv})
      }
    } else {
      const desiredWithdrawal = inv.balance - newBalance
      // Can't withdraw more than we have
      const goingToWithdraw = Math.min(inv.balance, desiredWithdrawal)
      if (goingToWithdraw > 0) {
        Account.transfer(goingToWithdraw, {source: inv, target: this.cash})
      }
    }
  }

  public dummyFunc() {
    xs
  }

  // private setMaxAccountBalances() {
  //   // Find the sum of all available credit and our cash amount and
  //   // add it to the balance of all accounts with a maxBalance of
  //   // Infinity, to make an "effective max" account balance for the
  //   // proposed accounts.
  //   const creditAvailable = this.availableCredit()
  //   const cashAvailable = this.cash.balance
  // }
}
