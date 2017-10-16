export function commas(x:number|string):string {
  if (typeof x === 'string') {
    return x
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function satsub(a:number, b:number):number {
  return Math.max(a-b, 0)
}
