const kindof = require("kind-of");

export default {
  install(Vue, VueRouter, options) {
    // Define routes
    const routes = require("vue-auto-routing").default;

    const loginRoute = routes.find(
      e => e.name == options.loginRoute || e.path == options.loginRoute
    );

    const catchAllRoute = routes.find(
      e => e.name == options.catchAllRoute || e.path == options.catchAllRoute
    );

    // Login path
    const getRedirectPath = function(to) {
      return {
        path: loginRoute ? loginRoute.path : "/",
        query: { redirect: to }
      };
    };

    //  Utils
    const isBoolean = function(n) {
      return kindof(n) === "boolean";
    };

    const isAllowed = function(modifiers) {
      return Object.keys(modifiers).some(m => options.userRoles().includes(m));
    };

    const setStyle = function(elm, style, descendentStyle) {
      if (!elm.originalStyle) {
        elm.originalStyle = Object.assign({}, elm.style);
      }

      const styles = Object.assign(style, descendentStyle || {});

      Object.keys(styles).forEach(name => {
        elm.style[name] = styles[name];
      });

      if (descendentStyle) {
        Object.keys(elm.children).forEach(i => {
          setStyle(elm.children[i], descendentStyle);
        });
      }
    };

    const resetStyle = function(elm) {
      if (elm.originalStyle) {
        elm.style = Object.assign({}, elm.originalStyle);
      }

      Object.keys(elm.children).forEach(i => {
        resetStyle(elm.children[i]);
      });
    };

    // 404 Register
    routes.push({
      path: "*",
      component: catchAllRoute ? catchAllRoute.component : null,
      meta: {
        isProtected: false
      }
    });

    // Route Meta
    routes.forEach(r => {
      if (!r.meta) r.meta = {};
      if (!r.meta.isModal) r.meta.isModal = Vue.observable({ value: false });
    });

    console.log(routes);

    // Create Router
    Vue.options.router = new VueRouter({
      history: true,
      mode: "history",
      routes
    });

    // Handle authentication
    Vue.options.router.beforeResolve((to, from, next) => {
      if (
        to.meta.isProtected &&
        to.path != options.loginPath &&
        !isAllowed(to.meta.modifiers)
      ) {
        //console.log(getLoginPath(to.fullPath));
        next(getRedirectPath(to.fullPath));
      } else {
        next();
      }

      next();
    });

    /**
     * Handle Authentication repository
     * supported args :
     *  modal
     */
    Vue.prototype.$routerExt = new Vue.observable({
      token: null,
      roles: []
    });

    Vue.mixin({
      computed: {
        isAuthenticated() {
          return Vue.prototype.$routerExt.token != null;
        }
      }
    });

    /**
     * Handle v-protect directive
     * supported args :
     *  modal
     */
    Vue.directive("protect", {
      bind(el, binding, vnode) {
        switch (binding.arg) {
          case "blur":
            if (!isAllowed(binding.modifiers)) {
              setStyle(
                el,
                {
                  filter: "blur(4px)",
                  opacity: "0.3"
                },
                {
                  "pointer-events": "none",
                  cursor: "not-allowed"
                }
              );
            } else {
              resetStyle(el);
            }
            break;
          case "disable":
            if (!isAllowed(binding.modifiers)) {
              setStyle(
                el,
                {
                  "background-color": "lightgray",
                  filter: "grayscale(100%)",
                  opacity: "0.6"
                },
                {
                  "pointer-events": "none",
                  cursor: "not-allowed"
                }
              );
            } else {
              resetStyle(el);
            }
            break;
          case "hide":
            if (!isAllowed(binding.modifiers)) {
              setStyle(vnode, { display: "none" });
            } else {
              resetStyle(el);
            }
            break;
          case "reroute":
            if (
              vnode.componentOptions &&
              vnode.componentOptions.tag == "router-link"
            ) {
              const to = vnode.componentOptions.propsData.to;
              const route = vnode.context.$router.match(to);
              if (isBoolean(route.meta.isProtected)) {
                //console.log('Add route meta info for route ' + route.path);
                route.meta.isProtected = true;
                route.meta.modifiers = binding.modifiers;
                //console.log('Verify current route ' + vnode.context.$route.path);
                if (route.name == vnode.context.$route.name) {
                  //console.log('immediate redirect to ' + to);
                  if (!isAllowed(binding.modifiers)) {
                    vnode.context.$router.replace(getRedirectPath(to));
                  }
                }
              }
            } else if (!isAllowed(binding.modifiers)) {
              // console.log('immediate redirect for component');
              vnode.context.$router.replace(
                getRedirectPath(vnode.context.$route.path)
              );
            }
            break;
        }
      },
      unbind(el, binding, vnode) {}
    });

    /**
     * Handle v-modal directive
     * supported args :
     *  modal
     */

    Vue.directive("modal", {
      bind(el, binding, vnode) {
        vnode.context.$route.meta.isModal.value = true;
      },
      unbind(el, binding, vnode) {
        vnode.context.$route.meta.isModal.value = false;
      }
    });
  }
};
