/**
 * AngularJS service to implement a finite state machine.
 * @version v1.2.1 - 2015-08-13
 * @link https://github.com/tafax/angular-state-machine
 * @author Matteo Tafani Alunno <matteo.tafanialunno@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */


'use strict';


// Source: src/angular-state-machine.js

var FSM = angular.module('FSM', []);


// Source: src/services/machine-configuration.js

/**
 * Service to handle the machine configuration.
 * It provides the ability to translate the rough JSON-like configuration
 * in a more comfortable one used by the machine.
 *
 * @param {Object} config The rough configuration.
 * @constructor
 */
function MachineConfiguration(config) {
    /**
     * The states available for the machine.
     *
     * @type {Object}
     * @private
     */
    var _states = {};

    /**
     * The messages available for transitions.
     *
     * @type {Array}
     * @private
     */
    var _messages = [];

    /**
     * The transitions of the machine.
     *
     * @type {Object}
     * @private
     */
    var _transitions = {};

    /**
     * Gets the states of the machine.
     *
     * @returns {Object}
     */
    this.getStates = function() {
        return _states;
    };

    /**
     * Gets the messages available.
     *
     * @returns {Array}
     */
    this.getMessages = function() {
        return _messages;
    };

    /**
     * Gets the transitions of the machine.
     *
     * @returns {Object}
     */
    this.getTransitions = function() {
        return _transitions;
    };

    /**
     * Extends the current configuration.
     * It is useful to create distributed configurations sets.
     *
     * @returns {String}
     */
    this.extend = function(extension) {
        config = angular.merge(config, extension);
    };

    /**
     * Configures the machine with the specifications in config.
     * Creates the states, the messages and the
     * transitions which are available to work with.
     */
    this.configure = function() {
        // Checks if the init state is defined.
        if(!config.hasOwnProperty('init')) {
            throw 'You have to create \'init\' state.';
        }

        // Performs a loop over all states.
        for(var i in config) {
            if(config.hasOwnProperty(i)) {
                // Each key in the object is a state and the key is the name of the state.
                var state = config[i];
                state.name = i;

                var transitions = {};
                if(state.hasOwnProperty('transitions')) {
                    // Retrieves all state transitions.
                    transitions = state['transitions'];

                    // Performs a loop over all defined transitions.
                    for(var j in transitions) {
                        if(transitions.hasOwnProperty(j)) {
                            // Each key in the transitions block is a message to change
                            // the state of the machine. It adds the message to the available ones.
                            if(_messages.indexOf(j) < 0) {
                                _messages.push(j);
                            }
                        }
                    }

                    // Removes the transitions in the state definition.
                    delete state.transitions;
                }

                // Creates the transition if it doesn't exist.
                if(!_transitions.hasOwnProperty(i)) {
                    _transitions[i] = {};
                }

                // Merges the transition with the parsed one.
                angular.extend(_transitions[i], transitions);

                // Creates the state if it doesn't exist.
                if(!_states.hasOwnProperty(i)) {
                    _states[i] = {};
                }

                // Merges the state with the parsed one.
                angular.extend(_states[i], state);
            }
        }
    };
}


// Source: src/services/state-machine.js

/**
 * Class to provide the functionality to manage the
 * state machine.
 *
 * @param {MachineStrategy} strategy
 * @param {MachineConfiguration} machineConfiguration
 * @constructor
 */
function StateMachine(strategy, machineConfiguration) {
    /**
     * Initializes the machine and sets the current state
     * with the init state.
     */
    this.initialize = function() {
        strategy.initialize(machineConfiguration);
    };

    /**
     * Gets the current state name.
     *
     * @returns {String}
     */
    this.getCurrentState = function() {
        return strategy.getCurrentState();
    };

    /**
     * Gets an array of the states.
     *
     * @returns {Array}
     */
    this.getStates = function() {
        return strategy.getStates(machineConfiguration);
    };

    /**
     * Gets an array of the messages.
     *
     * @returns {Array}
     */
    this.getMessages = function() {
        return strategy.getMessages(machineConfiguration);
    };

    /**
     * Checks if the specific message is one of the
     * messages of the machine.
     *
     * @param {String} message
     * @returns {boolean}
     */
    this.hasMessage = function(message) {
        return strategy.hasMessage(machineConfiguration, message);
    };

    /**
     * Checks if the specific message is available
     * for the current state.
     *
     * @param {String} message
     * @returns {boolean}
     */
    this.isAvailable = function(message) {
        return strategy.isAvailable(machineConfiguration, message);
    };

    /**
     * Gets an array of the messages available for
     * the current state.
     *
     * @returns {Array}
     */
    this.available = function() {
        return strategy.available(machineConfiguration);
    };

    /**
     * Sends a message to the state machine and changes
     * the current state according to the transitions.
     *
     * @param {String} message
     * @param {Object} [parameters]
     */
    this.send = function(message, parameters) {
        return strategy.send(machineConfiguration, message, parameters);
    };
}

/**
 * The state machine provider configures the machine with
 * a rough configuration provided as a javascript object.
 */
FSM.provider('stateMachine', function StateMachineProvider() {
    /**
     * The state machine configuration.
     *
     * @type {Object}
     * @private
     */
    var _config;

    /**
     * Sets the configuration for the state
     * machine.
     *
     * @param {Object} config
     */
    this.config = function(config) {
        _config = config;
    };

    /**
     * Gets a new instance of StateMachine specifying the
     * arguments passed to the provider.
     *
     * @type {Array}
     */
    this.$get = ['$q', '$injector', function($q, $injector) {
        return new StateMachine(new SyncStrategy($q, $injector), new MachineConfiguration(_config));
    }];
});

// Source: src/strategies/machine-strategy.js

/**
 * Defines the base class to represent a machine core strategy.
 * The machine strategy is the way how the machine itself resolves
 * the transitions to go ahead state by state.
 *
 * @constructor
 */
function MachineStrategy(){}

MachineStrategy.prototype.initialize = function(machineConfiguration){};
MachineStrategy.prototype.getCurrentState = function(){};
MachineStrategy.prototype.getStates = function(machineConfiguration){};
MachineStrategy.prototype.getMessages = function(machineConfiguration){};
MachineStrategy.prototype.hasMessage = function(machineConfiguration, message){};
MachineStrategy.prototype.isAvailable = function(machineConfiguration, message){};
MachineStrategy.prototype.available = function(machineConfiguration){};
MachineStrategy.prototype.send = function($injector, machineConfiguration, message, parameters){};


// Source: src/strategies/sync-strategy.js

/**
 * Class to provide the machine functionality
 * in synchronous mode.
 *
 * @param {Object} $q
 * @param {Object} $injector
 * @constructor
 */
function SyncStrategy($q, $injector) {
    MachineStrategy.call(this);
    this.currentState = null;

    this.$q = $q;
    this.$injector = $injector;

    // Handles the promises to create a chain.
    this.lastPromise = null;
}

/**
 * Initializes the prototype.
 *
 * @type {MachineStrategy}
 */
MachineStrategy.prototype = new MachineStrategy();

/**
 * Initializes the machine and sets the current state with the init state.
 *
 * @param {MachineConfiguration} machineConfiguration
 */
SyncStrategy.prototype.initialize = function(machineConfiguration) {
    machineConfiguration.configure();
    var states = machineConfiguration.getStates();
    this.currentState = states['init'];
    this.currentState.params = {};
};

/**
 * Gets the current state.
 *
 * @returns {String}
 */
SyncStrategy.prototype.getCurrentState = function() {
    var fsm = this;
    return this.$q.when(this.lastPromise)
      .then(function(){
          return fsm.currentState.name;
      })
      .catch(function(){
          return fsm.$q.when(fsm.currentState.name);
      });
};

/**
 * Gets an array of the states.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @returns {Array}
 */
SyncStrategy.prototype.getStates = function(machineConfiguration) {
    return Object.keys(machineConfiguration.getStates());
};

/**
 * Gets an array of the messages.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @returns {Array}
 */
SyncStrategy.prototype.getMessages = function(machineConfiguration) {
    return machineConfiguration.getMessages();
};

/**
 * Checks if the specific message is one of the messages of the machine.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @param {String} message
 * @returns {boolean}
 */
SyncStrategy.prototype.hasMessage = function(machineConfiguration, message) {
    var messages = machineConfiguration.getMessages();
    return (messages.indexOf(message) >= 0);
};

/**
 * Checks if the specific message is available for the current state.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @param {String} message
 * @returns {boolean}
 */
SyncStrategy.prototype.isAvailable = function(machineConfiguration, message) {
    var fsm = this;
    var transitions = machineConfiguration.getTransitions();
    return this.$q.when(this.lastPromise)
      .then(function(){
          
          var edges = transitions[fsm.currentState.name];
          return edges.hasOwnProperty(message);
      })
      .catch(function(){
          var edges = transitions[fsm.currentState.name];
          return fsm.$q.when(edges.hasOwnProperty(message));
      });
};

/**
 * Gets an array of the messages available for the current state.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @returns {Array}
 */
SyncStrategy.prototype.available = function(machineConfiguration) {
    var fsm = this;
    var transitions = machineConfiguration.getTransitions();
    return this.$q.when(this.lastPromise)
      .then(function(){
          var edges = transitions[fsm.currentState.name];
          return Object.keys(edges);
      })
      .catch(function(){
          var edges = transitions[fsm.currentState.name];
          return fsm.$q.when(Object.keys(edges));
      });
};

/**
 * Sends a message to the state machine and changes
 * the current state according to the transitions.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @param {String} message
 * @param {Object} [parameters]
 */
SyncStrategy.prototype.send = function(machineConfiguration, message, parameters) {

    var fsm = this;

    this.lastPromise = this.$q.when(this.lastPromise).then(function(){

        // TODO: isAvailable depends on lastPromise, but it should use inside this function. Cycle.
        // Retrieves all transitions.
        var transitions = machineConfiguration.getTransitions();
        var edges = transitions[fsm.currentState.name];

        // Checks if the configuration has the message and it is available for the current state.
        if (!fsm.hasMessage(machineConfiguration, message) || !edges.hasOwnProperty(message)) {
            // If the action is rejected we delete the promise stack.
            fsm.lastPromise = null;
            return fsm.$q.reject();
        }

        // Gets the edge related with the message.
        var edge = edges[message];

        // If the edge is an array it defines a list of transitions that should have a predicate
        // and a final state. The predicate is a function that returns true or false and for each message
        // only one predicate should return true.
        if (edge instanceof Array) {
            var passed = [];
            // Checks the predicate for each transition in the edge.
            for (var i in edge) {
                var transition = edge[i];
                // Checks predicate and if it passes add the final state to the passed ones.
                if (fsm.$injector.invoke(transition.predicate, this, fsm.currentState)) {
                    passed.push(transition.to);
                }
            }

            // Checks if more than one predicate returned true. It is an error.
            if (passed.length > 1) {
                throw 'Unable to execute transition in state \'' + fsm.currentState.name + '\'. ' +
                'More than one predicate is passed.';
            }

            // Replace the edge with the unique finale state.
            edge = passed[0];
        }

        // Retrieves the next state that will be the final one for this transition.
        var states = machineConfiguration.getStates();
        var state = states[edge];

        // Creates a copy of the current state. It is more secure against accidental changes.
        var args = {};
        args = angular.merge(args, fsm.currentState);
        delete args.action;

        // If some parameters are provided it merges them into the current state.
        if (parameters) {
            angular.merge(args.params, parameters);
        }

        var result = undefined;
        if (state.action && (typeof state.action === 'function' || Object.prototype.toString.call(state.action) === '[object Array]')) {
            result = fsm.$injector.invoke(state.action, fsm, args);
        }

        // Executes the action defined in the state by passing the current state with the parameters. Since it is not
        // possible to determine if the result is a promise or not it is wrapped using $q.when and treated as a promise
       return fsm.$q.when(result)
         .then(function (result) {

            // Checks the result of the action and sets the parameters of the new current state.
            if (!result && fsm.currentState.params) {
                state.params = fsm.currentState.params;
            }
            else {
                // Creates the parameters if the state doesn't have them.
                if (!state.hasOwnProperty('params')) {
                    state.params = {};
                }

                // Merges the state parameters with the result.
                angular.merge(state.params, result);
            }

            // Sets the new current state.
            fsm.currentState = state;
        })
         .catch(function () {
             // If the action is rejected we delete the promise stack.
             fsm.lastPromise = null;
             return fsm.$q.reject();
         });
    });

    return this.lastPromise;
};
