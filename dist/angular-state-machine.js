/**
 * AngularJS service to implement a simple finite state machine.
 * @version v0.2.0 - 2014-01-27
 * @link https://github.com/tafax/angular-state-machine
 * @author Matteo Tafani Alunno <matteo.tafanialunno@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */


'use strict';


// Source: src/angular-state-machine.js

var FSM = angular.module('FSM', []);

// Source: src/services/state-machine.js

/**
 * The state machine provider configures the machine
 * to use specification from JSON file and/or using
 * async/sync mode.
 */
FSM.provider('stateMachine', function StateMachineProvider()
{
    /**
     * Merges two objects in one
     * by adding the properties
     * in the result.
     *
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {Object}
     */
    Object.merge = function(obj1, obj2)
    {
        var result = {};

        for(var i in obj1)
        {
            result[i] = obj1[i];

            if((i in obj2) && (typeof obj1[i] === "object") && (i !== null))
                result[i] = Object.merge(obj1[i],obj2[i]);
        }

        for(var j in obj2)
        {
            if(j in result)
                continue;

            result[j] = obj2[j];
        }

        return result;
    };

    /**
     * Class to provide the current machine
     * configuration.
     *
     * @param {Object} config
     * @param {String} json
     * @constructor
     */
    function MachineConfiguration(config, json)
    {
        /**
         * Gets the JSON string which represents
         * the file for configuration.
         *
         * @returns {String}
         */
        this.getJson = function()
        {
            return json;
        };

        /**
         * Extends the configuration provided
         * by the provider with the object
         * specified.
         *
         * @param {Object} configuration
         */
        this.extend = function(configuration)
        {
            config = Object.merge(config, configuration);
        };

        /**
         * The states available for the machine.
         *
         * @type {Object}
         * @private
         */
        var _states = {};

        /**
         * Gets the states of the machine.
         *
         * @returns {Object}
         */
        this.getStates = function()
        {
            return _states;
        };

        /**
         * The messages available for transitions.
         *
         * @type {Array}
         * @private
         */
        var _messages = [];

        /**
         * Gets the messages available.
         *
         * @returns {Array}
         */
        this.getMessages = function()
        {
            return _messages;
        };

        /**
         * The transitions of the machine.
         *
         * @type {Object}
         * @private
         */
        var _transitions = {};

        /**
         * Gets the transitions of the machine.
         *
         * @returns {Object}
         */
        this.getTransitions = function()
        {
            return _transitions;
        };

        /**
         * Configures the machine with the specifications in config.
         * Creates the states, the messages and the
         * transitions which are available to work with.
         */
        this.configure = function()
        {
            if(!config.hasOwnProperty('init'))
                throw 'You have to create \'init\' state.';

            for(var i in config)
            {
                var state = config[i];
                state.name = i;

                var transitions = {};
                if(state.hasOwnProperty('transitions'))
                {
                    transitions = state['transitions'];

                    for(var j in transitions)
                    {
                        if(_messages.indexOf(j) < 0)
                            _messages.push(j);
                    }

                    delete state.transitions;
                }

                if(!_transitions.hasOwnProperty(i))
                    _transitions[i] = {};

                angular.extend(_transitions[i], transitions);

                if(!_states.hasOwnProperty(i))
                    _states[i] = {};

                angular.extend(_states[i], state);
            }
        };
    }

    /////////////////////////////////////////////////////////////////////////////////

    function MachineStrategy(){}

    MachineStrategy.prototype.initialize = function(machineConfiguration){};
    MachineStrategy.prototype.getStates = function(machineConfiguration){};
    MachineStrategy.prototype.getMessages = function(machineConfiguration){};
    MachineStrategy.prototype.hasMessage = function(machineConfiguration, message){};
    MachineStrategy.prototype.isAvailable = function(machineConfiguration, message){};
    MachineStrategy.prototype.available = function(machineConfiguration){};
    MachineStrategy.prototype.send = function($injector, machineConfiguration, message, parameters){};

    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Class to provide the machine functionality
     * in synchronous mode.
     *
     * @constructor
     */
    function SyncStrategy()
    {
        MachineStrategy.call(this);

        this.current = null;
    }

    MachineStrategy.prototype = new MachineStrategy();

    /**
     * Initializes the machine and sets the current state
     * with the init state.
     *
     * @param {MachineConfiguration} machineConfiguration
     */
    SyncStrategy.prototype.initialize = function(machineConfiguration)
    {
        machineConfiguration.configure();
        var states = machineConfiguration.getStates();
        this.current = states['init'];
        this.current.params = {};
    };

    /**
     * Gets an array of the states.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @returns {Array}
     */
    SyncStrategy.prototype.getStates = function(machineConfiguration)
    {
        return Object.keys(machineConfiguration.getStates());
    };

    /**
     * Gets an array of the messages.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @returns {Array}
     */
    SyncStrategy.prototype.getMessages = function(machineConfiguration)
    {
        return machineConfiguration.getMessages();
    };

    /**
     * Checks if the specific message is one of the
     * messages of the machine.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @param {String} message
     * @returns {boolean}
     */
    SyncStrategy.prototype.hasMessage = function(machineConfiguration, message)
    {
        var messages = machineConfiguration.getMessages();
        return (messages.indexOf(message) >= 0);
    };

    /**
     * Checks if the specific message is available
     * for the current state.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @param {String} message
     * @returns {boolean}
     */
    SyncStrategy.prototype.isAvailable = function(machineConfiguration, message)
    {
        var transitions = machineConfiguration.getTransitions();
        var edges = transitions[this.current.name];
        return edges.hasOwnProperty(message);
    };

    /**
     * Gets an array of the messages available for
     * the current state.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @returns {Array}
     */
    SyncStrategy.prototype.available = function(machineConfiguration)
    {
        var transitions = machineConfiguration.getTransitions();
        var edges = transitions[this.current.name];
        return Object.keys(edges);
    };

    /**
     * Sends a message to the state machine and changes
     * the current state according to the transitions.
     *
     * @param {Object} $injector
     * @param {MachineConfiguration} machineConfiguration
     * @param {String} message
     * @param {Object} [parameters]
     */
    SyncStrategy.prototype.send = function($injector, machineConfiguration, message, parameters)
    {
        if(machineConfiguration.getMessages().indexOf(message) >= 0)
        {
            var transitions = machineConfiguration.getTransitions();

            if(transitions.hasOwnProperty(this.current.name))
            {
                var edges = transitions[this.current.name];
                if(edges.hasOwnProperty(message))
                {
                    var edge = edges[message];

                    if(edge instanceof Array)
                    {
                        var passed = [];
                        for(var i in edge)
                        {
                            var transition = edge[i];
                            if($injector.invoke(transition.predicate, this, this.current))
                                passed.push(transition.to);
                        }

                        if(passed.length > 1)
                            throw 'Unable to execute transition in state \'' + this.current.name + '\'. ' +
                                'Two predicates was passed.';

                        edge = passed[0];
                    }

                    var states = machineConfiguration.getStates();
                    var state = states[edge];

                    var args = {};
                    args = Object.merge(args, this.current);

                    if(parameters)
                        args.params = Object.merge(args.params, parameters);

                    var result = $injector.invoke(state.action, this, args);

                    if(!result && this.current.params)
                        state.params = this.current.params;
                    else
                    {
                        if(!state.hasOwnProperty('params'))
                            state.params = {};

                        state.params = Object.merge(state.params, result);
                    }

                    this.current = state;
                }
            }
        }
    };

    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Class to provide the machine functionality
     * in asynchronous mode.
     *
     * @param {Object} $http
     * @param {Object} $q
     * @constructor
     */
    function AsyncStrategy($http, $q)
    {
        SyncStrategy.call(this);

        this.http = $http;
        this.q = $q;
        this.promise = null;
    }

    /**
     * Initializes the prototype.
     *
     * @type {SyncStrategy}
     */
    AsyncStrategy.prototype = new SyncStrategy();

    /**
     * Initializes the machine and sets the current state
     * with the init state.
     *
     * @param {MachineConfiguration} machineConfiguration
     */
    AsyncStrategy.prototype.initialize = function(machineConfiguration)
    {
        this.promise = this.http({
            method: 'GET',
            url: 'file://' + machineConfiguration.getJson()
        }).then(function(response)
            {
                machineConfiguration.extend(response.data);
                SyncStrategy.prototype.initialize(machineConfiguration);
            },
            function(response)
            {
                throw 'Unable to load \'' + json + '\'. The server responds with status ' + response.status + '.';
            });
    };

    /**
     * Gets an array of the states.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @returns {Array}
     */
    AsyncStrategy.prototype.getStates = function(machineConfiguration)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.getStates(machineConfiguration));
            });

            return deferred.promise;
        }
        else
            throw 'You have to initialize the machine.'
    };

    /**
     * Gets an array of the messages.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @returns {Array}
     */
    AsyncStrategy.prototype.getMessages = function(machineConfiguration)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.getMessages(machineConfiguration));
            });

            return deferred.promise;
        }
        else
            throw 'You have to initialize the machine.'
    };

    /**
     * Checks if the specific message is one of the
     * messages of the machine.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @param {String} message
     * @returns {boolean}
     */
    AsyncStrategy.prototype.hasMessage = function(machineConfiguration, message)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.hasMessage(machineConfiguration, message));
            });

            return deferred.promise;
        }
        else
            throw 'You have to initialize the machine.'
    };

    /**
     * Checks if the specific message is available
     * for the current state.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @param {String} message
     * @returns {boolean}
     */
    AsyncStrategy.prototype.isAvailable = function(machineConfiguration, message)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.isAvailable(machineConfiguration, message));
            });

            return deferred.promise;
        }
        else
            throw 'You have to initialize the machine.'
    };

    /**
     * Gets an array of the messages available for
     * the current state.
     *
     * @param {MachineConfiguration} machineConfiguration
     * @returns {Array}
     */
    AsyncStrategy.prototype.available = function(machineConfiguration)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.available(machineConfiguration));
            });

            return deferred.promise;
        }
        else
            throw 'You have to initialize the machine.'
    };

    /**
     * Sends a message to the state machine and changes
     * the current state according to the transitions.
     *
     * @param {Object} $injector
     * @param {MachineConfiguration} machineConfiguration
     * @param {String} message
     * @param {Object} [parameters]
     */
    AsyncStrategy.prototype.send = function($injector, machineConfiguration, message, parameters)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.send($injector, machineConfiguration, message, parameters));
            });

            return deferred.promise;
        }
        else
            throw 'You have to initialize the machine.'
    };

    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Class to provide the functionality to manage the
     * state machine.
     *
     * @param {Object} $injector
     * @param {MachineStrategy} strategy
     * @param {MachineConfiguration} machineConfiguration
     * @constructor
     */
    function StateMachine($injector, strategy, machineConfiguration)
    {
        /**
         * Initializes the machine and sets the current state
         * with the init state.
         */
        this.initialize = function()
        {
            strategy.initialize(machineConfiguration);
        };

        /**
         * Gets an array of the states.
         *
         * @returns {Array}
         */
        this.getStates = function()
        {
            return strategy.getStates(machineConfiguration);
        };

        /**
         * Gets an array of the messages.
         *
         * @returns {Array}
         */
        this.getMessages = function()
        {
            return strategy.getMessages(machineConfiguration);
        };

        /**
         * Checks if the specific message is one of the
         * messages of the machine.
         *
         * @param {String} message
         * @returns {boolean}
         */
        this.hasMessage = function(message)
        {
            return strategy.hasMessage(machineConfiguration, message);
        };

        /**
         * Checks if the specific message is available
         * for the current state.
         *
         * @param {String} message
         * @returns {boolean}
         */
        this.isAvailable = function(message)
        {
            return strategy.isAvailable(machineConfiguration, message);
        };

        /**
         * Gets an array of the messages available for
         * the current state.
         *
         * @returns {Array}
         */
        this.available = function()
        {
            return strategy.available(machineConfiguration);
        };

        /**
         * Sends a message to the state machine and changes
         * the current state according to the transitions.
         *
         * @param {String} message
         * @param {Object} [parameters]
         */
        this.send = function(message, parameters)
        {
            strategy.send($injector, machineConfiguration, message, parameters);
        };
    }

    /**
     * JSON file to load configuration.
     *
     * @type {String|null}
     * @private
     */
    var _json = null;

    /**
     * The state machine configuration.
     *
     * @type {Object}
     * @private
     */
    var _config = {};

    /**
     * Specifies if the machine is in
     * asynchronous mode.
     *
     * @type {boolean}
     * @private
     */
    var _async = false;

    /**
     * Sets the configuration for the state
     * machine.
     *
     * @param {Object} config
     */
    this.config = function(config)
    {
        _config = config;
    };

    /**
     * Sets the JSON file to load the
     * configuration.
     *
     * @param {String} json
     */
    this.load = function(json)
    {
        _json = json;
        _async = true;
    };

    /**
     * Gets a new instance of StateMachine specifying the
     * arguments passed to the provider.
     *
     * @type {Array}
     */
    this.$get = ['$injector', function($injector)
    {
        //var strategy = (_async ? new AsyncStrategy($http, $q) : new SyncStrategy());
        var strategy = (_async ? null : new SyncStrategy());

        return new StateMachine($injector, strategy, new MachineConfiguration(_config, _json));
    }];
});