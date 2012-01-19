require('ember-handlebars/ext');

var EmberHandlebars = Ember.Handlebars, getPath = Ember.getPath;

var ActionHelper = EmberHandlebars.ActionHelper = {};

ActionHelper.registerAction = function(actionName, eventName, target, view) {
  var actionId = (++jQuery.uuid).toString(),
      existingHandler = view[eventName];

  view[eventName] = function(event) {
    if ($(event.target).attr('data-ember-action') === actionId) {
      return target[actionName](event);
    } else if (existingHandler) {
      return existingHandler.call(view, event);
    }
  };

  return actionId;
};

EmberHandlebars.registerHelper('action', function(actionName, options) {
  var hash = options.hash || {},
      eventName = options.hash.on || "click",
      view = options.data.view,
      target; // Do we need to worry about the specified target changing?

  if (view.isVirtual) { view = view.get('parentView'); }
  target = options.hash.target ? getPath(this, options.hash.target) : view;

  var actionId = ActionHelper.registerAction(actionName, eventName, target, view);
  return new EmberHandlebars.SafeString('data-ember-action="' + actionId + '"');
});
