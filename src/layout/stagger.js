d3.layout.stagger = function() {
  var x = d3_layout_stackX,
      dx = d3_layout_staggerDx,
      out = d3_layout_staggerOut;

  function stagger(data, index) {
    var i = -1,
        n = data.length,
        steps = data.map(step).sort(d3_layout_staggerSort),
        step,
        y0,
        active = [];

    function step(d, i) {
      var x0 = +x.call(stagger, d, i);
      return {x0: x0, x1: +dx.call(stagger, d, i) + x0, data: d};
    }

    while (++i < n) {
      step = steps[i];
      y0 = 0;
      while (y0 in active) {
        if (active[y0] <= step.x0) {
          delete active[y0];
          break;
        }
        y0++;
      }
      active[y0] = step.x1;
      out.call(stagger, step.data, y0);
    }

    return data;
  }

  stagger.x = function(v) {
    if (!arguments.length) return x;
    x = d3.functor(v);
    return stagger;
  };

  stagger.dx = function(v) {
    if (!arguments.length) return dx;
    dx = d3.functor(v);
    return stagger;
  };

  stagger.dy = function(v) {
    if (!arguments.length) return dy;
    dy = d3.functor(v);
    return stagger;
  };

  stagger.out = function(v) {
    if (!arguments.length) return out;
    out = v;
    return stagger;
  };

  return stagger;
};

function d3_layout_staggerDx(d) {
  return d.dx;
}

function d3_layout_staggerOut(d, y) {
  d.y = y;
}

function d3_layout_staggerSort(a, b) {
  return a.x0 - b.x0;
}
