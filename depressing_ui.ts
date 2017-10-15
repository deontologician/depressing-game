import { h,
         VNode,
         VNodeChild,
         VNodeProperties } from './third-party/maquette'

export function commas(x:number|string):string {
  if (typeof x === 'string') {
    return x
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function makeli$(title:string, value:number|string): VNode {
  return h('li', {key: title}, [`${title}: $${commas(value)}`])
}

export function makeli(title:string, value:number|string): VNode {
  return h('li', {key: title}, [`${title}: ${commas(value)}`])
}

export function dangerButton(
    onclick: (ev: MouseEvent) => boolean | void,
    buttonText: string,
  bind?: Object): VNode {
  return h('a.button.is-danger', { onclick, bind }, [buttonText])
}

export function rangeSlider<T>(
  state: T,
  prop: keyof T,
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

export function label(key: string, text: string): VNode {
  return h('label', { key }, [text])
}

export function form(...children: VNodeChild[]): VNode {
  return h('form', ...children)
}

export function formGroup(...children: VNodeChild[]): VNode {
  return h('div.form-group', children)
}
