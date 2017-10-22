export function commas(x:number|string):string {
  if (typeof x === 'string') {
    return x
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function satsub(a:number, b:number):number {
  return Math.max(a-b, 0)
}

export function unwrapInt(func: (val: number) => void) {
  return function(ev: Event) {
    let target = ev.target
    if (!(target instanceof HTMLInputElement)) { return }
    return func(parseInt(target.value))
  }
}
