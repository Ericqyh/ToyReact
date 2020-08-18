const RENDER_TO_DOM = Symbol('render_to_dom')

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(key, value) {
    // 绑定事件
    if (key.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(
        RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
        value
      )
    } else {
      // className改成class
      if (key === 'className') {
        this.root.setAttribute('class', value)
      } else {
        this.root.setAttribute(key, value)
      }
    }
  }
  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }
  setAttribute(key, value) {
    this.props[key] = value
  }
  appendChild(component) {
    this.children.push(component)
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }
  rerender() {
    let oldRange = this._range

    let range = document.createRange()
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)
    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }
  setState(newState) {
    // 如果初始的state为null或不是对象
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      this.rerender()
      return
    }
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p]
        } else {
          merge(oldState[p], newState[p])
        }
      }
    }

    merge(this.state, newState)
    this.rerender()
  }
}

/**
 * webpack打包代码时，会自动调用的方法，有以下参数
 *
 * @param {string| Component} type 要创建的元素类型，string表示原生的html标签，Component表示自定义组件
 * @param {Object} attributes 属性对象列表
 * @param  {...any} children 子元素列表
 */
export function createElement(type, attributes, ...children) {
  let ele
  // 第一个参数支持原生的dom标签或自定义组件
  if (typeof type === 'string') {
    ele = new ElementWrapper(type)
  } else {
    ele = new type()
  }

  // 遍历并设置属性
  for (let p in attributes) {
    ele.setAttribute(p, attributes[p])
  }
  // 遍历并设置子节点
  let insertChildren = (children) => {
    for (let child of children) {
      // 如果是字符串，则创建文本节点并重新赋值child
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      // 空节点不处理
      if (child === null) {
        continue
      }
      if (Array.isArray(child)) {
        insertChildren(child)
      } else {
        ele.appendChild(child)
      }
    }
  }
  insertChildren(children)

  //返回
  return ele
}

/**
 * 将自定义组件渲染到原生的DOM节点
 *
 * @param {Component} component 自定义组件
 * @param {HTMLElement} parentNode 要绑定到的DOM节点
 */
export function render(component, parentNode) {
  let range = document.createRange()
  range.setStart(parentNode, 0)
  range.setEnd(parentNode, parentNode.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}
