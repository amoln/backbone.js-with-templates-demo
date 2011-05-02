class Event < ActiveRecord::Base
  attr_accessible :title, :description, :attendees, :my_rsvp
  def to_json(options = {})
    super(options.merge(:only => [ :id, :title, :description, :attendees ]))
  end
  
end
