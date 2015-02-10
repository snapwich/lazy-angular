
// concept from http://www.bennadel.com/blog/2554-loading-angularjs-components-with-requirejs-after-application-bootstrap.htm

exports.module = function(name, dependencies) {

    if(typeof dependencies !== "undefined" && dependencies.indexOf("ui.router") === -1) {
        dependencies.push("ui.router");
    }

    var app = angular.module(name, dependencies);

    if(typeof dependencies !== "undefined") {

        app.config(function($controllerProvider, $provide, $compileProvider, $filterProvider, $stateProvider){

            angular.extend(app, {
                controller: chain(function(name, constructor) {
                    $controllerProvider.register(name, constructor);
                }),
                service: chain(function(name, constructor) {
                    $provide.service(name, constructor);
                }),
                factory: chain(function(name, constructor) {
                    $provide.factory(name, constructor);
                }),
                value: chain(function(name, value) {
                    $provide.value(name, value);
                }),
                constant: chain(function(name, value) {
                    $provide.constant(name, value);
                }),
                directive: chain(function(name, factory) {
                    $compileProvider.directive(name, factory)
                }),
                filter: chain(function(name, factory) {
                    $filterProvider.register(name, factory);
                }),
                route: chain(function(name, config, factory) {
                    if(typeof factory === "undefined") {
                        $stateProvider.state(name, config);
                    } else {
                        config = angular.extend({}, config, {
                            templateProvider: function ($q) {
                                return $q(function(resolve) {
                                    factory(function loadTemplate(template) {
                                        resolve(template);
                                    });
                                });
                            }
                        });
                        $stateProvider.state(name, config);
                    }
                })
            });

        });

        angular.extend(app, {
            bootstrap: chain(function(elem) {
                angular.bootstrap(elem, [name]);
            })
        })
    }

    return app;
            
    function chain(cb) {
        return function() {
            cb.apply(this, arguments);
            return this;
        }
    }
};
