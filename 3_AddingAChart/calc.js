
// Self-executing wrapper
(function($){

	var App = {};
	
    App.LoanCalc = Backbone.Model.extend({
        defaults: {
            term: 60, //months
            rate: 3.5, //percent
            amount: 15000,
			payment: 0, // per month
			principle: 0,
			interest: 0,
			totalLoan: 0
        },
        initialize: function(){
            this.on("change:term", function(model){
                this.calcPayments();
            });
            this.on("change:rate", function(model){
                this.calcPayments();
            });
            this.on("change:amount", function(model){
                this.calcPayments();
            });
			
			this.calcPayments();
        },
		calcPayments: function() {			
			var term = this.get("term");
			var rate = this.get("rate");
			var amount = this.get("amount");
			
			//a compound model for interest
			var percent_rate = 1 + (rate * .01);
			var totalLoan = amount * Math.pow(percent_rate, term/12);
			var monthly_payment = totalLoan / term;

			//Formatting
			var output = new Number(monthly_payment);
			output = output.toFixed(2);
			output = "$" + output.toString();
			this.set({payment: output});
			
			var principle = amount;
			var interest = totalLoan - principle;
			
			this.set({principle: amount, interest: interest});
			
		}
    });


	App.LoanView = Backbone.View.extend({
 		el: $("#loan-form"),

	    events: {
	      "change input": "updateModel",
		  "slide #term_slider": "updateSliderTerm",
		  "slide #rate_slider": "updateSliderRate",
		  "slide #amount_slider": "updateSliderAmount"
	 	},

	    initialize: function(){
		
	        this.model.view = this;
			var html = _.template($('#loan-tpl').html(), this.model.toJSON());    
			this.$el.html(html);
			this.initSliders();
			
			this.listenTo(this.model, "change", this.render);
	    },

		render: function() {
			$("#payment").text(this.model.attributes.payment);			
		    return this;
		},

		updateModel: function(e){
			
			var changeSet = {};
			changeSet[e.target.id] = e.target.value;
	    	this.model.set(changeSet);
	  	},
	
		updateSliderTerm: function(e, ui){
			$("#term").val(ui.value);
			this.model.set({term: ui.value});
		},
		updateSliderRate: function(e, ui){
			$("#rate").val(ui.value);
			this.model.set({rate: ui.value});
		},
		updateSliderAmount: function(e, ui){
			$("#amount").val(ui.value);
			this.model.set({amount: ui.value});
		},
		
		initSliders: function(){
		
		    $("#term_slider").slider({
		      value: $("#term").val(),
		      min: 12,
		      max: 72,
		      step: 12
		    });	
		
		    $("#rate_slider").slider({
		      value: $("#rate").val(),
		      min: 1.0,
		      max: 15.0,
			  step: 0.1
		    });
		
		    $("#amount_slider").slider({
		      value: $("#amount").val(),
		      min: 1000,
		      max: 50000,
			  step: 250
		    });				
		}
	

	});
	
	
	App.LoanChartView = Backbone.View.extend({
 		el: $("#chart-ui"),

	    events: {
	 	},
		chart: {pie: null, svg: null, path: null, arc: null},
	    initialize: function(){
			var width = 200,
			    height = 200,
			    radius = Math.min(width, height) / 2;

			var color = d3.scale.ordinal()
			    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

			this.chart.arc = d3.svg.arc()
			    .outerRadius(radius - 10)
			    .innerRadius(0);

			this.chart.pie = d3.layout.pie()
			    .sort(null)
			    .value(function(d) { return d.amt; });

			this.chart.svg = d3.select("body").append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .append("g")
			    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
			
			 var data = 
			  [
			    {"desc": "Principle", "amt": this.model.attributes.principle},
			    {"desc": "Interest", "amt": this.model.attributes.interest}
			  ];

			  data.forEach(function(d) {
			    d.amt = +d.amt;
			  });

			  this.chart.path = this.chart.svg.selectAll("path")
			      .data(this.chart.pie(data))
			      .enter().append("path")
			      .attr("fill", function(d){ return color(d.data.desc); })
			      .attr("d", this.chart.arc);
			
			  var legend = d3.select("body").append("svg")
			      .attr("class", "legend")
			      .attr("width", radius * 2)
			      .attr("height", radius * 2)
			    .selectAll("g")
			      .data(color.domain().slice().reverse())
			    .enter().append("g")
			      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			  legend.append("rect")
			      .attr("width", 18)
			      .attr("height", 18)
			      .style("fill", color);

			  legend.append("text")
			      .attr("x", 24)
			      .attr("y", 9)
			      .attr("dy", ".35em")
			      .text(function(d) { return d; });
			
	          this.model.view = this;
			  this.listenTo(this.model, "change", this.render);
	    },

		render: function() {
			 var data = 
			  [
			    {"desc": "Principle", "amt": this.model.attributes.principle},
			    {"desc": "Interest", "amt": this.model.attributes.interest}
			  ];

			this.chart.path = this.chart.path.data(this.chart.pie(data)); // update the data			
		  	this.chart.path.attr("d", this.chart.arc); // redraw the arcs
		

			return this;
		},
	
	});
	
	var loanCalc = new App.LoanCalc();
	
	var loanView = new App.LoanView({model: loanCalc}); 
	loanView.render();
	
	var loanChartView = new App.LoanChartView({model: loanCalc}); 
	loanChartView.render();	
})(jQuery);

