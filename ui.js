'use strict'

var UI = (function(maquette) {
  var exports = {}
  var h = maquette.h

  let commas = exports.commas = (x) => {
    if (x != null) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } else {
      return ''
    }
  }
  let $ = exports.$ = (val) => `$${commas(val)}`

  let li = exports.li = (...args) => h('li', ...args)
  let b = exports.b = (...args) => h('b', ...args)
  let ul = exports.ul = (...args) => h('ul', ...args)
  let label = exports.label = (...args) => h('label', ...args)
  let p = exports.p = (...args) => h('p', ...args)
  let div = exports.div = (...args) => h('div', ...args)
  let span = exports.span = (...args) => h('span', ...args)

  let keyvalLi = exports.keyvalLi = (key, val) =>
      li({key}, [b(key), `: ${val}`])
  let keyvalLi$ = exports.keyvalLi$ = (key, val) =>
      keyvalLi(key, $(val))

  let successButton = exports.successButton = (...args) =>
      h('a.btn.btn-large.btn-success', ...args)

  let slider$ = exports.slider$ = ({name, prop, bind, update, max}) =>
      div([
        label({key: `label-${prop}`}, `${name} ${$(bind[prop])}`),
        h('input.slider', {
          type: 'range',
          min: 0,
          max,
          step: 1,
          key: prop,
          value: bind[prop],
          oninput: update,
          bind
        }),
        span($(max)),
      ])

  let sliderForm = exports.sliderForm = (children) =>
      h('form', [h('div.form-group', children)])

  return exports
})(maquette)
