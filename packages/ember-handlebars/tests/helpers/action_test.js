var application, view,
    ActionHelper = Ember.Handlebars.ActionHelper,
    originalRegisterAction = ActionHelper.registerAction;

var appendView = function() {
  Ember.run(function() { view.appendTo('#qunit-fixture'); });
};

module("Ember.Handlebars - action helper", {
  setup: function() {
    application = Ember.Application.create();
  },

  teardown: function() {
    Ember.run(function() {
      view.destroy();
      application.destroy();
    });
  }
});

test("should output a data attribute with a guid", function() {
  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit"}}>')
  });

  appendView();

  ok(view.$('[data-ember-action]').length, "a data attribute should be added to the tag");
  ok(view.$('a').attr('data-ember-action').match(/\d+/), "should have a guid");
});

test("should by default register a click event", function() {
  var registeredEventName;

  ActionHelper.registerAction = function(_, eventName) {
    registeredEventName = eventName;
  };

  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit"}}>')
  });

  appendView();

  equals(registeredEventName, 'click');

  ActionHelper.registerAction = originalRegisterAction;
});

test("should allow alternate events to be handled", function() {
  var registeredEventName;

  ActionHelper.registerAction = function(_, eventName) {
    registeredEventName = eventName;
  };

  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit" on="mouseUp"}}>')
  });

  appendView();

  equals(registeredEventName, 'mouseUp');

  ActionHelper.registerAction = originalRegisterAction;
});

test("should by default target the containing view", function() {
  var registeredTarget;

  ActionHelper.registerAction = function(_, _, target) {
    registeredTarget = target;
  };

  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit"}}>')
  });

  appendView();

  equals(registeredTarget, view);

  ActionHelper.registerAction = originalRegisterAction;
});

test("should allow a target to be specified", function() {
  var registeredTarget;

  ActionHelper.registerAction = function(_, _, target) {
    registeredTarget = target;
  };

  var anotherTarget = Ember.View.create();

  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit" target="anotherTarget"}}>'),
    anotherTarget: anotherTarget
  });

  appendView();

  equals(registeredTarget, anotherTarget);

  ActionHelper.registerAction = originalRegisterAction;
});

test("should attach an event handler on the parent view", function() {
  var eventHandlerWasCalled = false;

  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit"}}>click me</a>'),
    edit: function() { eventHandlerWasCalled = true; }
  });

  appendView();

  ok('function' === typeof view.get('click'));

  view.$('a').trigger('click');

  ok(eventHandlerWasCalled);
});

test("should wrap an existing event handler on the parent view", function() {
  var eventHandlerWasCalled = false,
      originalEventHandlerWasCalled = false;

  view = Ember.View.create({
    template: Ember.Handlebars.compile('<a href="#" {{action "edit"}}>click me</a>'),
    click: function() { originalEventHandlerWasCalled = true; },
    edit: function() { eventHandlerWasCalled = true; }
  });

  appendView();

  view.$('a').trigger('click');

  ok(eventHandlerWasCalled);
  ok(!originalEventHandlerWasCalled);

  eventHandlerWasCalled = false;
  originalEventHandlerWasCalled = false;

  view.$().trigger('click');

  ok(!eventHandlerWasCalled);
  ok(originalEventHandlerWasCalled);
});

test("should be able to use action more than once for the same event within a view", function() {
  var editWasCalled = false,
      deleteWasCalled = false,
      originalEventHandlerWasCalled = false;

  view = Ember.View.create({
    template: Ember.Handlebars.compile(
      '<a id="edit" href="#" {{action "edit"}}>edit</a><a id="delete" href="#" {{action "delete"}}>delete</a>'
    ),
    click: function() { originalEventHandlerWasCalled = true; },
    edit: function() { editWasCalled = true; },
    delete: function() { deleteWasCalled = true; }
  });

  appendView();

  view.$('#edit').trigger('click');

  ok(editWasCalled);
  ok(!deleteWasCalled);
  ok(!originalEventHandlerWasCalled);

  editWasCalled = deleteWasCalled = originalEventHandlerWasCalled = false;

  view.$('#delete').trigger('click');

  ok(!editWasCalled);
  ok(deleteWasCalled);
  ok(!originalEventHandlerWasCalled);

  editWasCalled = deleteWasCalled = originalEventHandlerWasCalled = false;

  view.$().trigger('click');

  ok(!editWasCalled);
  ok(!deleteWasCalled);
  ok(originalEventHandlerWasCalled);
});

test("should work properly in an #each block", function() {
  var eventHandlerWasCalled = false;

  view = Ember.View.create({
    items: Ember.A([1, 2, 3, 4]),
    template: Ember.Handlebars.compile('{{#each items}}<a href="#" {{action "edit"}}>click me</a>{{/each}}'),
    edit: function() { eventHandlerWasCalled = true; }
  });

  appendView();

  ok('function' === typeof view.get('click'));

  view.$('a').trigger('click');

  ok(eventHandlerWasCalled);
});

test("should work properly in a #with block", function() {
  var eventHandlerWasCalled = false;

  view = Ember.View.create({
    something: {ohai: 'there'},
    template: Ember.Handlebars.compile('{{#with something}}<a href="#" {{action "edit"}}>click me</a>{{/with}}'),
    edit: function() { eventHandlerWasCalled = true; }
  });

  appendView();

  ok('function' === typeof view.get('click'));

  view.$('a').trigger('click');

  ok(eventHandlerWasCalled);
});
