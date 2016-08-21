/*
 pogomap 2016-08-13 
*/

"use strict";
! function() {
    var a = function a(b, c, d) {
        var e, f = c.split(" ");
        for (e in f) b.addEventListener(f[e], d)
    };
    ! function() {
        function a(a) {
            this.el = a;
            for (var b = a.className.replace(/^\s+|\s+$/g, "").split(/\s+/), c = 0; c < b.length; c++) d.call(this, b[c])
        }

        function b(a, b, c) {
            Object.defineProperty ? Object.defineProperty(a, b, {
                get: c
            }) : a.__defineGetter__(b, c)
        }
        if (!("undefined" == typeof window.Element || "classList" in document.documentElement)) {
            var c = Array.prototype,
                d = c.push,
                e = c.splice,
                f = c.join;
            a.prototype = {
                add: function a(b) {
                    this.contains(b) || (d.call(this, b), this.el.className = this.toString())
                },
                contains: function a(b) {
                    return this.el.className.indexOf(b) !== -1
                },
                item: function a(b) {
                    return this[b] || null
                },
                remove: function a(b) {
                    if (this.contains(b))
                        for (var c = 0; c < this.length && this[c] !== b; c++) e.call(this, c, 1), this.el.className = this.toString()
                },
                toString: function a() {
                    return f.call(this, " ")
                },
                toggle: function a(b) {
                    return this.contains(b) ? this.remove(b) : this.add(b), this.contains(b)
                }
            }, window.DOMTokenList = a, b(Element.prototype, "classList", function() {
                return new a(this)
            })
        }
    }();
    var b = document.querySelector("body");
    skel.breakpoints({
        xlarge: "(max-width: 1680px)",
        large: "(max-width: 1280px)",
        medium: "(max-width: 980px)",
        small: "(max-width: 736px)",
        xsmall: "(max-width: 480px)"
    }), b.classList.add("is-loading"), window.addEventListener("load", function() {
        b.classList.remove("is-loading")
    });
    var c = document.querySelector("#nav"),
        d = document.querySelector('a[href="#nav"]'),
        e, f = document.querySelector("#stats"),
        g = document.querySelector('a[href="#stats"]'),
        h;
    a(c, "click touchend", function(a) {
        a.stopPropagation()
    }), f && a(f, "click touchend", function(a) {
        a.stopPropagation()
    }), a(b, "click touchend", function(a) {
        a.target.matches('a[href="#nav"]') || f && a.target.matches('a[href="#stats"]') || (c.classList.remove("visible"), f && f.classList.remove("visible"))
    }), d.addEventListener("click", function(a) {
        a.preventDefault(), a.stopPropagation(), c.classList.toggle("visible")
    }), g && g.addEventListener("click", function(a) {
        a.preventDefault(), a.stopPropagation(), f.classList.toggle("visible")
    }), e = document.createElement("a"), e.href = "#", e.className = "close", e.tabIndex = 0, c.appendChild(e), f && (h = document.createElement("a"), h.href = "#", h.className = "close", h.tabIndex = 0, f.appendChild(h)), window.addEventListener("keydown", function(a) {
        27 === a.keyCode && (c.classList.remove("visible"), f && f.classList.remove("visible"))
    }), e.addEventListener("click", function(a) {
        a.preventDefault(), a.stopPropagation(), c.classList.remove("visible")
    }), h && h.addEventListener("click", function(a) {
        a.preventDefault(), a.stopPropagation(), f.classList.remove("visible")
    })
}();
//# sourceMappingURL=app.min.js.map