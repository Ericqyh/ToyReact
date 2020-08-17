import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  render() {
    return (
      <div>
        <div>my component</div>
        {this.children}
      </div>
    )
  }
}

// window.div1 = <div id="idd" class="classs">
//     <div>1</div>
//     <div>2</div>
//     <div>3</div>
// </div>

render(
  <MyComponent id="idd" class="classs">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </MyComponent>,
  document.body
)
