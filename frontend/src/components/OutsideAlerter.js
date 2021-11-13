import React from 'react';

class OutsideAlerter extends React.Component {
  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();
    this.setChildNodeRef = this.setChildNodeRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setChildNodeRef(ref) {
    this.childNode = ref;
  }

  handleClickOutside(event) {
    if (this.childNode && !this.childNode.contains(event.target)) {
      this.props.onOutsideClick();
    }
  }

  render() {
    return <div ref={this.setChildNodeRef}>{this.props.children}</div>;
  }
}

export default OutsideAlerter;
