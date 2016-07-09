

/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
function bubbleChart() {
  // Constants for sizing
  var width = 940;
  var height = 600;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var top_topicCenters = {
    0: { x: width / 3, y: height / 11 },
    1: { x: 2 * width / 3, y: height / 11  },
    2: { x: width / 3, y: 2 * height / 11  },
    3: { x: 2 * width / 3, y: 2 * height / 11  },
    4: { x: width / 10, y: 3 * height / 11 },
    5: { x: 2 * width / 3, y: 3 * height / 11  },
    6: { x: width / 3, y: 4*height / 11  },
    7: { x: 2 * width / 3, y: 4*height / 11  },
    8: { x: width / 3, y: 5*height / 11  },
    9: { x: 2 * width / 3, y: 5*height / 11  },
    10: { x: width / 3, y: 6*height / 11 },
    11: { x: 2 * width / 3, y: 6 * height / 11 },
    12: { x: width / 3, y: 7 * height / 11 },
    13: { x: 2 * width / 3, y: 7 * height / 11 },
    14: { x: width / 3, y: 8 * height / 11 },
    15: { x: 2 * width / 3, y: 8 * height / 11 },
    16: { x: width / 3, y: 9 * height / 11 },
    17: { x: 2 * width / 3, y: 9 * height / 11 },
    18: { x: width / 3, y: 10 * height / 11 },
    19: { x: 2 * width / 3, y: 10 * height / 11 }
  };

  // X locations of the top_topic titles.
  var top_topicsTitleX = {
    0: 40,
    1: 80,
    2: 120,
    3: 160,
    4: 200,
    5: 240,
    6: 280,
    7: 320,
    8: 360,
    9: 400,
    10: 440,
    11: 480,
    12: 520,
    13: 560,
    14: 600,
    15: 640,
    16: 680,
    17: 720,
    18: 760,
    19: 800
  };

  // Used when setting up force and
  // moving around nodes
  var damper = 0.102;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // Charge function that is called for each node.
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  // Charge is negative because we want nodes to repel.
  // Dividing by 8 scales down the charge to be
  // appropriate for the visualization dimensions.
  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 8;
  }

  // Here we create a force layout and
  // configure it to use the charge function
  // from above. This also sets some contants
  // to specify how the force layout should behave.
  // More configuration is done below.
  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);


  // Nice looking colors - no reason to buck the trend
  var fillColor = d3.scale.ordinal()
    .domain(['low', 'medium', 'high'])
    .range(['#d84b2a', '#beccae', '#7aa25c']);

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([2, 85]);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.tot_words),
        value: d.tot_words,
        name: d.Employee,
        top_topic_percentage: d.Ap,
        top_topic: d.A,

        //all datafields associated with d
        A: d.A, Ap: d.Ap,
        B: d.B, Bp: d.Bp,
        C: d.C, Cp: d.Cp,
        D: d.D, Dp: d.Dp,
        E: d.E, Ep: d.Ep,
        F: d.F, Fp: d.Fp,
        G: d.G, Gp: d.Gp,
        H: d.H, Hp: d.Hp,
        I: d.I, Ip: d.Ip,
        J: d.J, Jp: d.Jp,
        K: d.K, Kp: d.Kp,
        L: d.L, Lp: d.Lp,
        M: d.M, Mp: d.Mp,
        N: d.N, Np: d.Np,
        O: d.O, Op: d.Op,
        P: d.P, Pp: d.Pp,
        Q: d.Q, Qp: d.Qp,
        R: d.R, Rp: d.Rp,
        S: d.S, Sp: d.Sp,
        T: d.T, Tp: d.Tp,

        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number by converting it
    // with `+`.
    var maxAmount = d3.max(rawData, function (d) { return +d.tot_words; });
    radiusScale.domain([0, maxAmount]);

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.top_topic_percentage); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.top_topic_percentage)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius

    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Sets visualization in "single group mode".
   * The top_topic labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideTop_topics();
    damper = 0;
    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "single group mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it toward the center of
   * the visualization.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  /*
   * Sets visualization in "split by top_topic mode".
   * The top_topic labels are shown and the force layout
   * tick function is set to move nodes to the
   * top_topicCenter of their data's top_topic.
   */
  function splitBubbles() {
    showTop_topics();

    force.on('tick', function (e) {
      bubbles.each(moveToTop_topics(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "split by top_topic mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the top_topic center for that
   * node.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToTop_topics(alpha) {
    return function (d) {
      var target = top_topicCenters[d.top_topic];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides Top_topic title displays.
   */
  function hideTop_topics() {
    svg.selectAll('.top_topic').remove();
  }

  /*
   * Shows Top_topic title displays.
   */
  function showTop_topics() {
    // Another way to do this would be to create
    // the top_topic texts once and then just hide them.
    var top_topicsData = d3.keys(top_topicsTitleX);
    var top_topics = svg.selectAll('.top_topic')
      .data(top_topicsData);

    top_topics.enter().append('text')
      .attr('class', 'top_topic')
      .attr('x', function (d) { return top_topicsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black').on("click", function(d){return showPie(d);});

    var content = '<span class="name">Employee: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Top Topic: </span><span class="value">' +
                  d.top_topic +
                  '</span><br/>' +
                  '<span class="name">Top Topic Relevance: </span><span class="value">' +
                  d.top_topic_percentage * 100 + "%" +
                  '</span>';
    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.top_topic_percentage)).darker());
    tooltip.hideTooltip();
  }
  /*
   * Function called on bubble click to display 
   * pie-chart of topic distribution for emploee
   */
  function showPie(emp) {
    console.log(emp)

  	var radius = width/4
  	var colour = d3.scale.category20b();
  	var x_pie = width
  	var y_pie = length

  	var dataset = [{"label": emp.A, "value": emp.Ap },
				{"label": emp.B, "value": emp.Bp },
				{"label": emp.C, "value": emp.Cp },
				{"label": emp.D, "value": emp.Dp },
				{"label": emp.E, "value": emp.Ep },
				{"label": emp.F, "value": emp.Fp },
				{"label": emp.G, "value": emp.Gp },
				{"label": emp.H, "value": emp.Hp },
				{"label": emp.I, "value": emp.Ip },
				{"label": emp.J, "value": emp.Jp },
				{"label": emp.K, "value": emp.Kp },
				{"label": emp.L, "value": emp.Lp },
				{"label": emp.M, "value": emp.Mp },
				{"label": emp.N, "value": emp.Np },
				{"label": emp.O, "value": emp.Op },
				{"label": emp.P, "value": emp.Pp },
				{"label": emp.Q, "value": emp.Qp },
				{"label": emp.R, "value": emp.Rp },
				{"label": emp.S, "value": emp.Sp },
				{"label": emp.T, "value": emp.Tp }];
    
  /*
   *We now create a svg element that is our pie chart
   */

  // var svg = d3.select("#vis")
  //             .append("svg")
  //             .attr("width", width)
  //             .attr("height", width)
  //             .append("g")
  //             .attr("transform", "translate(" + (width*3/5)  + "," + 150 + ")");

  var arc = d3.svg.arc().outerRadius(radius); 

  var pie = d3.layout.pie()
                     .value(function(d) {return d.value;})
                     .sort(null);


  var gee = svg.append("g").attr('id', 'removable');

  var path = gee.selectAll("path")
                .data(pie(dataset))
                .enter()
                .append("path")
                .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                .attr("d",arc)
                .attr("fill", function(d, i) {
                  return colour(d.data.label);
                });
  }

  function hidePie() {
    d3.select("#removable").remove();

  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by top_topic" modes.
   *
   * displayName is expected to be a string and either 'top_topic' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'top_topic') {
      hidePie();
    } else {
      damper = 0;
      var delay=100; //1 second
      setTimeout(function() {
        damper = 0.102;
      }, delay);
    }
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// Load the data.
d3.csv('data/bubbles_data.csv', display);

// setup the buttons.
setupButtons();
