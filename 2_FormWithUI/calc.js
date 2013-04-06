
// Self-executing wrapper
(function($){

	var App = {};
	
    App.LoanCalc = Backbone.Model.extend({
        defaults: {
            term: 60, //months
            rate: 3.5, //percent
            amount: 15000,
			payment: 0 // per month
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
			
			//a very simple model for interest
			var percent_rate = 1 + (rate * .01);
			var monthly_payment = amount * percent_rate / term;

			//Formatting
			var output = new Number(monthly_payment);
			output = output.toFixed(2);
			output = "$" + output.toString();
			this.set({payment: output});
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

	var loanView = new App.LoanView({model: new App.LoanCalc()}); 
	loanView.render();
})(jQuery);

