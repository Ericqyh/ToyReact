class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(key, value) {
    this.root.setAttribute(key, value)
  }
  appendChild(component) {
    this.root.appendChild(component.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }
  setAttribute(key, value) {
    this.props[key] = value
  }
  appendChild(component) {
    this.children.push(component)
  }
  // 获取root时，调用子类的render方法并获取root属性
  get root() {
    if (!this._root) {
      this._root = this.render().root
    }

    return this._root
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
  parentNode.appendChild(component.root)
}
