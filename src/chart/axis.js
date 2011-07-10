d3.chart.axis = function() {
  var tickFormat = null,
      tickCount = 10,
      tickSize = -6,
      tickPadding = 3,
      scale;

  function axis(g) {
    g.each(function(d, i) {
      var g = d3.select(this);

      // If the scale defines a ticks method, then use it to sample ticks from
      // the domain. Otherwise, we default to the domain itself, such as for
      // ordinal scales where we want to show each discrete value in the domain.
      var ticks = scale.ticks ? scale.ticks(tickCount) : scale.domain();

      // If a custom tick format is specified, used that; otherwise, use the
      // scale's tick format. Note this means that a tick format is required if
      // the scale does not provide a ticks method.
      var format = tickFormat || scale.tickFormat(tickCount);

      // Select the ticks and join with new data. The ticks are joined by
      // comparing the text content (for elements) to the output of the tick
      // format (for data). It'd be a bit cleaner if these were specified as two
      // separate join functions, but this results in a nice cross-fade when the
      // tick format changes for the same value (e.g., precision change).
      var tick = g.selectAll("g.tick").data(ticks, function() {
        return this.nodeType ? this.textContent : format.apply(this, arguments);
      });

      // tick enter
      var tickEnter = tick.enter().append("svg:g")
          .attr("class", "tick")
          .attr("transform", function(d) { return "translate(" + scale(d) + ",0)"; });

      tickEnter.append("svg:line")
          .attr("y2", -tickSize);

      tickEnter.append("svg:text")
          .attr("text-anchor", "middle")
          .attr("y", (tickSize < 0 ? -tickSize : 0) + tickPadding)
          .attr("dy", ".71em")
          .text(format);

      // tick update
      tick.attr("transform", function(d) { return "translate(" + scale(d) + ",0)"; });

      // tick exit
      tick.exit().remove();

      // axis
      var axis = g.selectAll("line.axis").data([,]);

      // axis enter
      axis.enter().append("svg:line")
          .attr("class", "axis")
          .attr("x1", scale.range()[0])
          .attr("x2", scale.range()[1]);

      // axis update
      axis
          .attr("x1", scale.range()[0])
          .attr("x2", scale.range()[1]);

      // axis exit
      axis.exit().remove();
    });
  }

  axis.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return axis;
  };

  axis.tickCount = function(x) {
    if (!arguments.length) return tickCount;
    tickCount = x;
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

  axis.scale = function(x) {
    if (!arguments.length) return scale;
    scale = x;
    return axis;
  };

  return axis;
};
