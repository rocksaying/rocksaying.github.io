---
title: ECMAScript 6 - Generator
category: programming
tags: [javascript,ecmascript,es6,iterator,yield]
---

{% highlight javascript %}
function hello(state) {
    var v = undefined;
    var done = false;
    if (!state.step)
        state.step = 0;
    switch (state.step) {
    case 0:
        v = 'hello';
        break;
    case 1:
        v = 'world';
        break;
    case 2:
        done = true;
        break;
    }
    ++state.step;
    return {'done': done, 'value': v};
}


var state = {}; // init state. like [Symbol.iterator]().
console.log(hello(state)); // next
console.log(hello(state)); // next

function* hello_g() {
    yield 'hello';
    yield 'world';
}

var iter = hello_g();
console.log(iter.next());
console.log(iter.next());

{% endhighlight %}


{% highlight javascript %}
var o = {
    'a': 1,
    'b': 2,
    'c': 3
};

function OI(v) {
    var o = v;
    var iter = [];
    var current = 0;

    this[Symbol.iterator] = function() {
        iter = [];
        current = 0;
        for (var k in o) {
            iter.push(k);
        }
        return this;
    }

    this.next = function() {
        var done, value;
        if (current < iter.length) {
            done = false;
            value = o[iter[current]];
            ++current;
        }
        else {
            done = true;
            value = undefined;
        }
        return {'done': done, 'value': value};
    }
}

var o1 = new OI(o);

for (var v of o1) {
    console.log(v); // 1,2,3
}

function* OG(obj) {
    for (var k in obj) {
        yield obj[k];
    }
}

for (var v of OG(o)) {
    console.log(v); // 1,2,3
}
{% endhighlight %}


{% highlight c %}

jmp_buf state;

generator() {
    for (i = 0; i < 3; ++i) {
        if (setjmp(state) == 0)
            return i;
    }
}

longjmp(state);


{% endhighlight %}
