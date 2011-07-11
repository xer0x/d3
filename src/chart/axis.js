d3.chart.axis = function() {
  var tickFormat = null,
      tickFunction = null,
      tickSize = -6,
      tickPadding = 3,
      mode = "open",
      open = true,
      minor = false,
      section = false,
      scale;

  function axis(g) {
    g.each(function(d, i) {
      var g = d3.select(this);

      // Retrieve the ticks, domain and range.
      var ticks = tickFunction ? tickFunction.call(this, d, i) : scale.ticks(10),
          domain = scale.domain(),
          range = scale.range();

      // If this is a polylinear domain, we just want the extent.
      if (domain.length !== 2) {
        domain = [domain[0], domain[domain.length - 1]];
        range = [range[0], range[range.length - 1]];
      }

      // Invert inverted domains.
      if (domain[0] > domain[1]) domain = [domain[1], domain[0]];

      // In "closed" mode, if the tick value is also in the domain, then we
      // don't want to draw the line; it will be drawn by the domain path below.
      // We do, of course, still want to draw the label for the tick. Also, by
      // toggling the display style rather than adding or removing, it will be
      // a bit easier to manage transitions.
      var display = open ? null : function(d) {
        return domain.indexOf(d) === -1 ? null : "none";
      };

      // In "minor" mode, subdivide the generated ticks so that there are extra
      // minor ticks between the major ones. This requires that the ticks are
      // evenly spaced (so no log ticks, no polylinear ticks, etc.). Also,
      // there's a chance that the first and last tick extend beyond the domain
      // and we need to avoid displaying those!
      if (minor) {
        ticks = d3_chart_axisSubdivide(ticks);
        var bit = ticks[0] < domain[0] - d3_chart_axisEpsilon ? (ticks.shift(), 1) : 0;
        if (ticks[ticks.length - 1] > domain[1] + d3_chart_axisEpsilon) ticks.pop();
      }

      // If a custom tick format is specified, used that; otherwise, use the
      // scale's tick format. Note this means that a tick format is required if
      // the scale does not provide a ticks method.
      var format = tickFormat || scale.tickFormat(10);

      // Select the ticks and join with new data. The ticks are joined by
      // comparing the text content (for elements) to the output of the tick
      // format (for data). It'd be a bit cleaner if these were specified as two
      // separate join functions, but this results in a nice cross-fade when the
      // tick format changes for the same value (e.g., precision change).
      var tick = g.selectAll("g.tick").data(ticks, function() {
        return this.nodeType ? this.textContent : format.apply(this, arguments);
      });

      // Enter a container for incoming ticks.
      var tickEnter = tick.enter().append("svg:g")
          .attr("class", "tick")
          .attr("transform", function(d) { return "translate(" + scale(d) + ",0)"; })
          .classed("minor", minor && function(d, i) { return (i & 1) === bit; })
          .classed("major", minor && function(d, i) { return (i & 1) !== bit; });

      // Add the tick line.
      tickEnter.append("svg:line")
          .attr("y2", -tickSize)
          .style("display", display);

      // Add the tick label. The ticks are always drawn on the bottom of the
      // line, so if the tick size is negative, then they are padded to y = 0.
      tickEnter.append("svg:text")
          .attr("text-anchor", "middle")
          .attr("y", (section ? 0 : Math.max(-tickSize, 0)) + tickPadding)
          .attr("x", section ? function(d, i) { return i < ticks.length - 1 - minor ? (scale(ticks[i + 1 + minor]) - scale(d)) / 2 : null; } : null)
          .attr("dy", ".71em")
          .style("display", section ? function(d, i) { return (i < ticks.length - 1 - minor) && (!minor || ((i & 1) !== bit)) ? null : "none"; } : (minor ? function(d, i) { return (i & 1) !== bit ? null : "none"; } : null))
          .text(format);

      // Update the tick positions and visibility.
      tick
          .attr("transform", function(d) { return "translate(" + scale(d) + ",0)"; })
        .select("line")
          .style("display", display);

      // Remove any outgoing ticks.
      tick.exit().remove();

      // Select the domain path element. There can be only one (so no exit)!
      var path = g.selectAll("path.domain").data([,]);

      // Enter the domain path element, if this is the first render.
      path.enter().append("svg:path")
          .attr("class", "domain")
          .attr("d", d3_chart_axisPath(range, open ? 0 : -tickSize));

      // Recompute the domain path.
      path.attr("d", d3_chart_axisPath(range, open ? 0 : -tickSize));
    });
  }

  axis.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x == null ? x : d3.functor(x);
    return axis;
  };

  axis.ticks = function(x) {
    if (!arguments.length) return tickFunction;
    tickFunction = x == null ? x : d3.functor(x);
    return axis;
  };

  axis.tickSize = function(x) {
    if (!arguments.length) return tickSize;
    tickSize = x;
    return axis;
  };

  axis.tickPadding = function(x) {
    if (!arguments.length) return tickPadding;
    tickPadding = x;
    return axis;
  };

  axis.mode = function(x) {
    if (!arguments.length) return mode;
    mode = "" + x;
    open = !/(?:^|-)closed(?:-|$)/i.test(mode);
    minor = /(?:^|-)minor(?:-|$)/i.test(mode);
    section = /(?:^|-)section(?:-|$)/i.test(mode);
    return axis;
  };

  axis.scale = function(x) {
    if (!arguments.length) return scale;
    scale = x;
    return axis;
  };

  return axis;
};

var d3_chart_axisEpsilon = 1e-10;

function d3_chart_axisPath(range, size) {
  return "M" + range[0] + "," + size + "V0H" + range[1] + "V" + size;
}

function d3_chart_axisSubdivide(ticks) {
  var ticks2 = [],
      i = -1,
      n = ticks.length,
      d = (ticks[1] - ticks[0]) / 2;
  ticks2.push(ticks[0] - d);
  while (++i < n) {
    ticks2.push(ticks[i]);
    ticks2.push(ticks[i] + d);
  }
  return ticks2;
}
