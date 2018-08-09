// Copyright (c) 2018 Aaron Shafovaloff
// https://github.com/aaronshaf/totes/blob/master/LICENSE

export default render => elementClass =>
  class extends elementClass {
    constructor() {
      super();
      this.props = {};
      for (let attr of this.attributes) {
        this.props[attr.name] = attr.value;
      }
      this._needsRender = false;
      this.setState = this.setState.bind(this);
    }

    attributeChangedCallback(name, _oldValue, newValue) {
      const nextProps = Object.assign({}, this.props, {
        [name]: newValue
      });
      this.maybeUpdate(nextProps, this.state);
    }

    async maybeUpdate(nextProps, nextState) {
      const prevProps = this.props;
      const prevState = this.state;

      const didPropsChange = shallowDiffers(prevProps, nextProps);
      const didStateChange = shallowDiffers(prevState, nextState);

      const shouldInvalidate = this.shouldComponentUpdate
        ? this.shouldComponentUpdate(nextProps, nextState)
        : didPropsChange || didStateChange;

      if (didPropsChange) {
        this.props = nextProps;
      }

      if (didStateChange) {
        this.state = nextState;
      }

      if (shouldInvalidate) {
        this.invalidate(prevProps, prevState);
      }
    }

    setState(delta) {
      const nextState = Object.assign({}, this.state, delta);
      this.maybeUpdate(this.props, nextState);
    }

    connectedCallback() {
      this.componentDidMount && this.componentDidMount();
      render(this.render(this), this);
    }

    disconnectedCallback() {
      if (this.componentWillUnmount) {
        console.warn("use componentDidUnmount instead");
      }

      if (this.componentDidUnmount) {
        this.componentDidUnmount();
      }
    }

    async invalidate(prevProps, prevState) {
      if (this._needsRender === false) {
        this._needsRender = true;
        this._needsRender = await false;
        const snapshot =
          this.componentDidUpdate && this.getSnapshotBeforeUpdate
            ? this.getSnapshotBeforeUpdate(prevProps, prevState)
            : null;
        render(this.render(this), this);
        if (this.componentDidUpdate) {
          this.componentDidUpdate(prevProps, prevState, snapshot);
        }
      }
    }
  };

// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
function shallowDiffers(a, b) {
  for (let i in a) if (!(i in b)) return true;
  for (let i in b) if (a[i] !== b[i]) return true;
  return false;
}
