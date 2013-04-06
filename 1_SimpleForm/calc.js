
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
			this.set({payment: output});
		}
    });


	App.LoanView = Backbone.View.extend({
 		el: $("#loan-form"),

	    events: {
	      "change input": "updateModel"
	 	},

	    initialize: function(){
		
	        this.model.view = this;
			this.listenTo(this.model, "change", this.render);
	    },

		render: function() {
			var html = _.template($('#loan-tpl').html(), this.model.toJSON());    
			this.$el.html(html);
		    return this;
		},

		updateModel: function(e){
			var changeSet = {};
			changeSet[e.target.id] = e.target.value;
	    	this.model.set(changeSet);
	  	},
	

	});

	var loanView = new App.LoanView({model: new App.LoanCalc()}); 
	loanView.render();
})(jQuery);

