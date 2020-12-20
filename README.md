# on-to-me

<a href="https://nodei.co/npm/on-to-me/"><img src="https://nodei.co/npm/on-to-me.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/on-to-me">

on-to-me is a small (~1kb) bare-bones version of [p-d](https://github.com/bahrus/p-et-alia).

Like p-et-alia components, one of the goals is to reduce, as much as possible, the gap between "First Meaningful Paint" and "Time to Interactive".  on-to-me focuses squarely on that problem, whereas p-et-alia addresses larger issues.  on-to-me will, in the future, provide some common functions used by p-et-alia.

Sample syntax:

```html
<button data-test=hello>My button</button>
<on-to-me on=click to=[-text-content] me=1 val=target.dataset.test ></on-to-me>
<div -text-content></div>
```

[Demo](https://jsfiddle.net/bahrus/5d7t064q/)

Features supported:

Attributes:  on, to, val, me, care-of, from, init-val, mutate-event, parse-val-as

mutate-event is used in conjunction with a web component like mut-obs, which can raise events when mutations occur.

Features not supported:

1.  Ability to block stopping propagation -- always blocks propagation
2.  Using properties instead of attributes to define the orchestration.
3.  Debugging support
4.  Ability to override value from event, filter events.
5.  More

## Running Locally

1.  Install node.js, git
2.  git clone https://github.com/bahrus/on-to-me
3.  Open command / terminal, cd to folder git was cloned to in step 2, run npm install
4.  Run npm install
5.  run npm run serve
6.  open http://localhost:3030/demo/dev.html

## Bootstrapping

This component was designed to be small and simple, with no dependencies, a kind of "bootup" component that could, if needed, be replaced by a more sophisticated component, like p-d, once the download for p-d is complete.  As such, it might be best to inline the [minified version](https://raw.githubusercontent.com/bahrus/on-to-me/baseline/dist/on-to-me.min.js) directly in index.html (or the equivalent):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <script type=module>export function getPreviousSib(t){let e=t;for(;e&&e.hasAttribute("on");)e=e.previousElementSibling,null===e&&(e=t.parentElement);return e}export function nudge(t)...</script>
</head>
...
</html>
```

## Bare import specifiers / bundling / import maps

1.  npm install --save on-to-me
2.  import on-to-me/on-to-me.js

## CDN

```html
<script type=module src=https://cdn.jsdelivr.net/npm/on-to-me@0.0.4/dist/on-to-me.min.js></script>
```



