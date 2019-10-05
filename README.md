<div align="center">

[![npm version](https://img.shields.io/npm/v/vue-easy-router.svg)](https://www.npmjs.com/package/vue-easy-router)
[![npm downloads](https://img.shields.io/npm/dt/vue-easy-router.svg)](https://www.npmjs.com/package/vue-easy-router)
[![license](https://img.shields.io/github/license/tomgrv/vue-easy-router.svg)](https://github.com/tomgrv/vue-easy-router/blob/master/LICENSE)

</div>

# vue-easy-router

Light router based on folder tree packaged as a vue plugin

## Installation

```bash
$ npm install vue-easy-router
```

## Overview

This packages provides a `<easy-state-machine>` component managing a small state machine for UI management

## Usage

Declare as Webpack plugin:

```js
plugins: [
  new VueAutoRoutingPlugin({
    // Path to the directory that contains your page components.
    pages: "resources/js/pages",

    // A string that will be added to importing component path (default @/pages/).
    importPrefix: "@/pages/",
    dynamicImport: false
  })
];
```

Declare as Vue plugin in your application:

```js
import VueRouter from "vue-router";
Vue.use(VueRouter);

import VueEasyRouter from "vue-easy-router";
Vue.use(VueEasyRouter, VueRouter, {
  catchAllRoute: "/errors/404",
  loginRoute: "/login",
  userRoles: () => ["guest"]
});
```

## Options

Each state can handle following items:

```js
{
   "catchAllRoute": "...",
   "loginRoute" : "...",
   "userRoles": () => []
}
```

### `catchAllRoute`

- Type: `String`
- Default: `undefined`
- Details: Default vue/route to display if requested route not found
- Restrictions: Can be vue name or path to vue

### `loginRoute`

- Type: `String`
- Default: `undefined`
- Details: Indicates login vue/route to redirect to in case of protected vue/route
- Restrictions: Can be vue name or path to vue

### `userRoles`

- Type: `Array`
- Default: `[]`
- Details: Indicates state to start with
- Restrictions: Only one `true` entry per state table. If multiple entries, only the first one is taken.

## Directives injected

This plugin injects directives to handle special features

### `v-modal`

This directive sets route meta variable `isModal` to true:

```html
<div v-modal>
  ...
</div>
```

to be reused in another component as:

```html
<div v-if="!$route.meta.isModal.value">
  ...
</div>
```

### `v-protect`

This directive specifies how a protected part of a vue that require appropriate role du be displayed (ex: `admin` role, `xxx` role, `yyy` role) should be handled when current user role is not matched.

```html
<div v-protect:blur.admin.xxx.yyy>
  ...
</div>
```

#### `blur`

- Usage: `v-protect:blur`
- Details: If current user Role is not matched, blur the component.
- Restrictions: blur via css, can be de-activated :)

#### `disable`

- Usage: `v-protect:disable`
- Details: If current user Role is not matched, disable the component.
- Restrictions: disable via css, can be de-activated :)

#### `hide`

- Usage: `v-protect:hide`
- Details: If current user Role is not matched, hide the component.
- Restrictions: disable via css, can be de-activated :)

#### `reroute`

- Usage: `v-protect:reroute`
- Details: If current user Role is not matched, immediately reroute to `loginRoute`
- Restrictions: none
