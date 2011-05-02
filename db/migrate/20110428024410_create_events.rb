class CreateEvents < ActiveRecord::Migration
  def self.up
    create_table :events do |t|
      t.string :title
      t.string :description
      t.integer :attendees
      t.boolean :my_rsvp, :default => false

      t.timestamps
    end
  end

  def self.down
    drop_table :events
  end
end
