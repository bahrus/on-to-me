# on-to-me

on-to-me is a small (~900b) bare-bones version of [p-d](https://github.com/bahrus/p-et-alia).

Sample syntax:

```html
<button data-test=hello>My button</button>
<on-to-me on=click to=[-text-content] val=target.dataset.test m=1></on-to-me>
<div -text-content></div>
```

Features supported:

Attributes:  on, to, val, m, care-of, from

Features not supported:

1.  Initial fake event
2.  Ability to block stopping propagation
3.  Using properties instead of attributes
4.  Debugging support
5.  Mutation observing -- keeping newly created elements in sync even after event occurred.
6.  Ability to override value from event, filter events.
7.  More

