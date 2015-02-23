#AngularJS State Machine [![Build Status](https://travis-ci.org/tafax/angular-state-machine.svg?branch=master)](https://travis-ci.org/tafax/angular-state-machine)

It is an AngularJS module to implement a [Finite-State Machine](http://en.wikipedia.org/wiki/Finite-state_machine).
It can be useful in many situations where the state of an app(or module) follows specific paths. For example, it is very useful to
implement a login module in a single page web application where the entire app depends on the login state and/or on the permissions of an user.
It's very simple also handling multiple challenges login or changing the user permissions/routing according to user profile.
The module provides features to manage those kind of situations with a simple configuration, offering an extensible and easy-maintainable
way to work.

#Features
* Create a state machine using a JSON-like configuration with a JS object.
* Define *transitions* using dictionary syntax.
* Define multiple *predicates* to choose which path the machine has to follow.
* Perform an *action* for each state.
* Change the configuration at any time to add new states or change the transitions.

#Installation
You can download this by:
* Using bower and running `bower install angular-state-machine --save` (recommended)
* Downloading manually the [unminified version](https://raw.github.com/tafax/angular-state-machine/master/dist/angular-state-machine.js) or
the [minified production version](https://raw.github.com/tafax/angular-state-machine/master/dist/angular-state-machine.min.js)

After installation, import the module in your app.
````javascript
var app = angular.module('myApp', ['FSM']);
````

#Dependecies
This module is dependency free.

#Configuration
As a general consideration you need to inject the state machine provider in your app configuration.
````javascript
app.config(['stateMachineProvider', function(stateMachineProvider) {
    // Your code...
}]);
````

###Very simple FSM
We want to create a state machine to handle the user login in a single page application. Our states will be `loggedIn` or
`notLoggedIn`. To perform a transition between the states we need to send a request and receive a `201` status code
from the server that indicates a successful login.
````javascript
stateMachineProvider.setConfig({
    init: { // This is the initial state(the not_logged_in one, but you have to call it 'init'). It is mandatory.
        transitions: {
            201: 'loggedIn'
        }
    },
    loggedIn: {
        // Right now the loggedIn state is empty.
    }
});
````
Afterwards, in the app run method we have to initialize the machine.
````javascript
myApp.run(['stateMachine', function(stateMachine) {
    stateMachine.initialize();
}]);
````
The machine is ready to receive messages. If the login was successful, a message `201` will be sent to the machine by invoking
`stateMachine.send('201');`, so the machine now is in the `loggedIn` state.

###Adding error handling
The previous machine is not so useful, but we can add some states to provide a more realistic usage of that configuration.
Let's add a state to handle a login error that the server returns if the response code is `401`.
````javascript
stateMachineProvider.setConfig({
    init: { // This is the initial state(the not_logged_in one, but you have to call it 'init'). It is mandatory.
        transitions: {
            201: 'loggedIn',
            401: 'loginError'
        }
    },
    loggedIn: {
        // Right now the loggedIn state is empty.
    },
    loginError: {
        action: ['myErrorHandler', 'params', function(myErrorHandler, params) {
            myErrorHandler.handle(params.response.code, params.response.data);
        }]
    }
});
````
We added a new key called `action` that is executed when the machine arrives in the related state. The `action` is handled
by the AngularJS injector so you can inject each service you want to use. In this case we injected a custom
error handler to manage the error. We injected also `params` that is a special key to retrieve the parameters passed
to the method `send` when it is invoked. So, by calling `stateMachine.send('401', {response: response});`, we will change the state
to `loginError` and the machine will call the `action` in which the `params` will be available to be used.

###Predicates for the transitions
In some cases when an error returns from the server for a given HTTP status code, the server provides an application code
that the app could use to manage different kind of handling. In this case we can use an application code as a transition message instead of
the status code or we can use the `predicate` feature.
````javascript
stateMachineProvider.setConfig({
    init: { // This is the initial state(the not_logged_in one, but you have to call it 'init'). It is mandatory.
        transitions: {
            201: 'loggedIn',
            401: [{
                to: 'loginError',
                predicate: function(params) {
                    return params.data.appCode <= 4015;
                }
            }, {
               to: 'loginConfirmation',
               predicate: function(params) {
                   return params.data.appCode == 4016;
               }
            }]
        }
    },
    loggedIn: {
        // Right now the loggedIn state is empty.
    },
    loginConfirmation: {
        // Right now the loggedIn state is empty.
    },
    loginError: {
        action: ['myErrorHandler', 'params', function(myErrorHandler, params) {
            myErrorHandler.handle(params.response.code, params.response.data);
        }]
    }
});
````
In this case we added two transitions for a single message `401`. Each one has a predicate that returns true or false depending
of the application code that the server returned. If it is less than `4015` the machine goes to the `loginError` state, but
if it is `4016` the machine goes to `loginConfirmation` so you can use the `action` to display, for example, a confirmation page to the user.

###More complex FSM
The examples above are only some simplified cases that the module can handle or, better, you can manage using a state machine. Anyway, by 
mixing the features we saw above, you can implement more complex FSM to handle many different kind of cases.

#Contributing
I love contributors :). If you think the module can be improved or you want to add a very cool feature, feel free to send a pull request at any time.
Anyway, please respect the coding standard of the rest of code and remember to add the tests to cover your changes.

#License
The MIT License (MIT)

Copyright (c) 2014 Matteo Tafani Alunno

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/tafax/angular-state-machine/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

