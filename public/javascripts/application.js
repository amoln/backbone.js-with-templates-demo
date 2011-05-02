$(function(){

	// Model for 'Event'
	var Event = Backbone.Model.extend({
		initialize: function() {
			// if needed.
		},
		
		// whenever I rsvp to any event, add it to My Events collection.
		rsvp: function() {
			this.save({"attendees" : this.get("attendees")+1, "my_rsvp" : true});
			if (myEvents!=null) {
				myEvents.add(this);
			}
		}
		
	});

	// View for a single 'Event'
	var EventView = Backbone.View.extend({
	
	   // Cache the template function for a single item.
		// This view uses ICanHaz.js (based on Mustache) template. Simply call ich.<template id> and it will return the template defined in the view as a compiled function.
		// Check home.html.erb for ICanHaz template.
	   template: ich.event,
	
	   // The DOM events specific to an item.
	   events: {
	     "click a.rsvp"              : "rsvpToEvent",
			 "click div.title"					 : "eventDetail"
	     // "dblclick div.todo-content" : "edit",
	     // "click span.todo-destroy"   : "clear",
	     // "keypress .todo-input"      : "updateOnEnter"
	   },
	
		 // Constructor	
	   initialize: function() {
	     _.bindAll(this, 'render');
	     this.model.bind('change', this.render);
	     
			//Do the below line only if you want the model to control view operations.
			 //this.model.view = this;
	   },
	
		//Some DOM action
		rsvpToEvent: function() {
			this.model.rsvp();
		},
	
		//Another DOM action.
		eventDetail: function() {
			app.eventDetail(this.model.clone());
		},
	
	   // Re-render the contents of the Event into its view.
	   render: function() {
			$(this.el).html(this.template(this.model.toJSON()))
	     return this;
	   }
	
	});

	// Another View for a single Event, with a different UI template
	var MyEventView = EventView.extend({
		
		// Cache the template function for a single item.
		// This view uses Handlebars.js (based on Mustache) template. Simply call Handlebars.compile(<template html>) and it will return the Handlebars template defined in the view as a compiled function.
		// Check home.html.erb for Handlebars template.
	  template: Handlebars.compile($("#my_event").html()),
	  
	  initialize: function() {
	    _.bindAll(this, 'render');
	    this.model.bind('change', this.render);
	     
			//Do the below line only if you want the model to control view operations.
			 //this.model.view = this;
	  },
	
	   // Re-render the contents of My Event into its view.
	   render: function() {
			$(this.el).html(this.template(this.model.toJSON()))
	     return this;
	   }
	
	})

	// A collection of Events with RESTful source at '/events'
	var EventCollection = Backbone.Collection.extend({
	  model: Event,
		url: '/events',
	});
	
	// The instance of the collection 'EventCollection' that will be used by other parts.
	var hubEvents;

	
	// Another collection of Events with RESTful source at '/events?my=true'. This one represent only 'My Events' at any point of time.
	var MyEventCollection = Backbone.Collection.extend({
	  model: Event,
		url: '/events?my=true',
	});
	
	// The instance of the collection 'MyEventCollection' that will be used by other parts.
	var myEvents;
	
	
	// The view that binds to 'hubEvents' Event Collection, renders the contents of the collection and handles any DOM actions on the collection.
	var HubEventsView = Backbone.View.extend({
		el: $("#events-main-tab"),
		
		//Any changes in the collection 'hubEvents' must be handled by the view and reflected in UI as necessary. 
		initialize: function() {
			_.bindAll(this,'render');
			hubEvents = new EventCollection;
			hubEvents.bind('refresh', this.render);
		  hubEvents.fetch();
		},
		
		// Re-render the contents of the entire collection.
		render: function() {
			this.$("#events-home").empty();
			hubEvents.each(function(event) {
				var view = new EventView({model: event});
				this.$("#events-home").append(view.render().el);
			})
		}
		
	});
	
	// The instance of the view 'HubEventsView' that will be used by other parts.
	var hubEventsView;
	
	
	// The view that binds to 'myEvents' Event Collection, renders the contents of the collection and handles any DOM actions on the collection.
	var MyEventsView = Backbone.View.extend({
		el: $("#events-main-tab"),

		//Any changes in the collection 'myEvents' must be handled by the view and reflected in UI as necessary. 
		initialize: function() {
			_.bindAll(this,'addOne','render');
			if (myEvents==null) {
				myEvents = new MyEventCollection;
			}
			myEvents.bind('refresh', this.render);
			myEvents.bind('add', this.addOne);
		  myEvents.fetch();
		},
		
		//A new event has been added to My Events collection, so render it.
		addOne: function(event) {
			var view = new MyEventView({model: event});
			this.$("#my-events").append(view.render().el);
		},
		
		// Re-render the contents of the entire collection.
		render: function() {
			this.$("#my-events").empty();
			myEvents.each(function(event) {
				var view = new MyEventView({model: event});
				this.$("#my-events").append(view.render().el);
			});
		}
		
	});
	
	// The instance of the view 'MyEventsView' that will be used by other parts.
	var hubEventsView;
	

	// The header tab "Events Home" on our page represents the Home page that will show 'Hub Events' and 'My Events' collections.
	// Lets make a 'EventsHomePage' View that takes care of invoking and managing the corresponding 'HubEventsView' and 'MyEventsView' views.
	var EventsHomePage = Backbone.View.extend({
		
		// Just invoked the corresponding views and let them do their job :-)
		// If any links/buttons on this page that are outside the scope of the two views below, but perform other tasks, they should be bound here to corresponding functions.
		initialize: function() {
		  hubEventsView = new HubEventsView;
			myEventsView = new MyEventsView;
		}
		
	});


	// The header tab "My Events" on our page represents the My Events page that will show 'My Events' collection.
	// Lets make a 'MyEventsPage' View that binds to 'myEvents' Event Collection, renders the contents of the collection and handles any DOM actions on the collection.
	// We cannot re-use the 'MyEventsView' due to a different design template on this page.
	// Also, unlike the 'EventsHomePage' which has to take care of multiple views inside it, this page only shows one type of collection. So one view can manage the entire page contents.
	var MyEventsPage = Backbone.View.extend({
		el: $("#my-events-tab"),
		
		//Any changes in the collection 'myEvents' must be handled by the view and reflected in UI as necessary. 
		initialize: function() {
			_.bindAll(this,'addOne','render');
			if (myEvents==null) {
				myEvents = new MyEventCollection;
			}
			myEvents.bind('refresh', this.render);
			myEvents.bind('add', this.addOne);
		  myEvents.fetch();
		},
		
		
		//A new event has been added to My Events collection, so render it.
		addOne: function(event) {
			var view = new EventView({model: event});
			this.$("#my-events2").append(view.render().el);
		},

		
		// Re-render the contents of the entire collection.
		render: function() {
			console.log("inside MyEventsPage render")
			this.$("#my-events2").empty()
			myEvents.each(function(event) {
				var view = new EventView({model: event});
				this.$("#my-events2").append(view.render().el);
			});
		}
		
	});


	// Our 3rd header tab 'Event Details' is used to show details of an Event, whenever someone clicks on the title of an event on 'Events Home' or 'My Events' pages.
	// On this page we will also allow users to add some comments for the event.
	// The page will have event details and comments as two separate sections/views, but will interact with each other.

	// Model for a 'Comment'
	var Comment = Backbone.Model.extend({
		initialize: function() {
		}

	});

	// Since we already know by now how to create and bind a view to a model, for Comment we will skip CommentView, 
	// Instead, let the view managing the CommentCollection render the comments.

	
	// A collection of Comments with RESTful source at '/events/:event_id/comments' assuming comment belongs to an event.
	var CommentCollection = Backbone.Collection.extend({
	  model: Comment,

		initialize: function(parentModel) {
			console.log("inside COmmentCOllection wikth parent")
			this.url = "/event/"+parentModel.id+"/comments"
			console.log(this.url)
		}

	});

	// Instance of the CommentCollection that will be used by other parts.
	var eventComments;


	// The view that binds to 'eventComments' Comment Collection, renders the contents of the collection and handles any DOM actions on the collection.
	// Lets display the total count of comments not in this view/section, but in the Event Detail view/section. Pass in a reference to the 'Event' model
	// so that we can notify it whenever a new comment is added. 
	
	var EventCommentsView = Backbone.View.extend({
		el: $("#event-detail-tab"),
		parentEvent: null,
		
		// For demo purposes, we will not create/save any comments on the server side, just keep them on client side.
		initialize: function(parentEvent) {
			_.bindAll(this,'render','addOne','addComment');
			this.parentEvent = parentEvent;
			eventComments = new CommentCollection(parentEvent);
			eventComments.bind('refresh', this.render);
			eventComments.bind('add', this.addOne);
		  eventComments.refresh([{"text":"Hello World"},{"text":"More of Hello World stuff"}]);
		
			// Add event handler for Add Comment button
			$("#submit-comment").click(this.addComment)
		},
		
		// Re-render the contents of the entire collection.
		// Since we dont have a CommentView, just create and render the html directly into the page.
		render: function() {
			this.$("#event-comments").empty();
			this.parentEvent.set({"comment_count":eventComments.length})
			eventComments.each(function(comment) {
				this.$("#event-comments").append("<div>Amol:"+comment.get('text')+"</div>");

			})
		},
		
		// A new comment has been added to the CommentCollection, so render it.
		addOne: function(comment) {
			this.$("#event-comments").append("<div>Amol:"+comment.get('text')+"</div>");
		},
		
		// The user has added a new comment, lets add the comment into the CommentCollection.
		addComment: function() {
			eventComments.add({"text":this.$("#new-comment").val()})
			this.parentEvent.set({"comment_count":eventComments.length})
		}

	});
	
	
	// The 'Event Details' page needs to display the details of an Event. Lets create a view that renders the required UI for an Event model.
	var EventDetailView = Backbone.View.extend({
	   
		 el: $("#event-detail-tab"),
		
		 // Cache the template function for a single item.
	   template: ich.event_detail,

	   // The DOM events specific to an item.
	   events: {
	     "click a.rsvp"              : "rsvpToEvent"
	     // "dblclick div.todo-content" : "edit",
	     // "click span.todo-destroy"   : "clear",
	     // "keypress .todo-input"      : "updateOnEnter"
	   },

	   initialize: function() {
	     _.bindAll(this, 'render');
	     this.model.bind('change', this.render);
				//Do the below line only if you want the model to control view operations.
			 this.model.view = this;
			this.model.trigger('change');
	   },

		 rsvpToEvent: function() {
		  	this.model.rsvp();
		 },

		 // Re-render the contents of the entire collection.
	   render: function() {
			 this.$("#event-detail").html(this.template(this.model.toJSON()))
	     return this;
	   }

	});


	// Finally, we need a single 'EventDetailPage' view that takes care of invoking and managing the corresponding 'EventDetailView' and 'EventCommentsView' views.
	var EventDetailPage = Backbone.View.extend({
		
		el: $("#event-detail-tab"),
		
		eventDetailView: null,
		eventCommentsView: null,

		// Since this page will only be displayed when user clicks on the Event title on 'Events Home' or 'My Events' page, 
		// there is no need to refresh/render any of our child views during initialization.
		initialize: function() {
			_.bindAll(this,'render','showEvent');
		},
			
		render: function() {
			this.$("#event-detail-tab").empty();
			this.showEvent();
		},
		
		// This will be the method called by views from 'Events Home' or 'My Events' pages with the corresponding Event model clone.
		// Just invoked the corresponding views and let them do their job :-)
		showEvent: function(event) {
			eventDetailView = new EventDetailView({model: event});
			eventCommentsView = new EventCommentsView(event);
		}
		
	});
	
	// Now that we have our 3 pages corresponding to the tabs defined by corresponding views, its time to setup navigation between these views.
	// One way to setup the navigation is using the Backbone.Controller and define the URL fragments that identify the pages to be displayed.
	// In this example however, we do not want to refresh the page and hence the URL cannot be modified. For this reason, the Controller cannot be used.

	// View to the rescue! Since we are using JQuery to generate the tabs and handle the navigation from page to page, we only need to intercept when a user clicks
	// on a tab and invoke the view corresponding to the page before/after the page is displayed by JQuery.
	// Lets create a top level View called 'App' and let it manage the navigation using JQuery and invoke the page level views.
	var eventsHomePage, myEventsPage, eventDetailPage;
	
	var App = Backbone.View.extend({
		el: $("#tabs"),
		
		initialize: function() {
			_.bindAll(this,'hubEvents','myEvents','eventDetail');
			if (eventsHomePage==null) {
				eventsHomePage = new EventsHomePage;
			}
			this.$("span.fragment-1").bind('click',this.hubEvents)
			this.$("span.fragment-2").bind('click',this.myEvents)
		},
		
		// Invoke the page level View 'EventsHomePage' since the user has clicked on the 'Events Home' tab.
		hubEvents: function() {
			if (eventsHomePage==null) {
				eventsHomePage = new EventsHomePage;
			}
			return true;
	  },

		// Invoke the page level View 'MyEventsPage' since the user has clicked on the 'My Events' tab.
	  myEvents: function() {
			if (myEventsPage==null) {
				myEventsPage = new MyEventsPage;
			}
			return true;
	  },
	
		// Invoke the page level View 'EventDetailPage' since the user has clicked on the title of an Event from other two pages.
		eventDetail: function(event) {
			this.$("a#fragment-3-tab").click();
			if (eventDetailPage==null) {
				eventDetailPage = new EventDetailPage;
			}
			eventDetailPage.showEvent(event);
		}
	  
	});
	
	// Lets create the top level View instance.
	var app = new App();
	
	// Lets draw the jQuery tabs now.
	$("#tabs").tabs();
});