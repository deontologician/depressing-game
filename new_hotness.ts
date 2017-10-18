// This file is intending to restructure depressing_data so that it is
// more generalizable to more account types and more people.
import { DepressingLog } from './depressing_state'
import { commas } from './utils'
import { VERY_DEPRESSING_DATA } from './depressing_data'

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
}

export abstract class Account {
  public readonly name: string
  public readonly minBalance: number
  public readonly maxBalance: number
  public readonly interestRate: number

  private _balance: number
  private parent: Account | null // Used to distinguish proposals

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
    this.maxBalance = opts.maxBalance || Infinity
    this.interestRate = opts.interestRate || 0
    this.parent = null
  }

  get balance(): number {
    return this._balance
  }

  makeProposal() {
    // Escape from type safety
    let proposed = new (<any>this.constructor(this))
    proposed.parent = this
    return proposed
  }
}

export class CashAccount extends Account {
  constructor() {
    super({name: 'cash'})
  }
}

export class CreditAccount extends Account {
  private canIncrease: boolean

  constructor({name, minBalance, interestRate, canIncrease}: {
    name: string,
    minBalance: number,
    interestRate: number,
    canIncrease: boolean,
  }) {
    super({maxBalance: 0, name, minBalance, interestRate})
    this.canIncrease = canIncrease
  }

  availableDebt() {
    if (!this.canIncrease) {
      return 0
    } else {
      return this.balance - this.minBalance
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

  availableDebt(): number {
    return this.debts.reduce((total, d) => total + d.availableDebt(), 0)
  }

  totalInvestments(): number {
    return this.investments.reduce((total, i) => total + i.balance, 0)
  }

  purchasesPrice(): number {
    return -this.purchases.reduce((total, i) => total + i.price, 0)
  }

  proposalSum(): number {
    return this.availableDebt() +
      this.currentDebt() +
      this.cash.balance +
      this.totalInvestments() +
      this.purchasesPrice()
  }

  sanityCheck() {
    this.proposalSum() === this.startingTotal
  }
}
