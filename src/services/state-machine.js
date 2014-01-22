'use strict';

/**
 * The state machine provider configures the machine
 * to use specification from JSON file and/or using
 * async/sync mode.
 */
FSM.provider('stateMachine', function StateMachineProvider()
{
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
         * Merges two objects in one
         * by adding the properties
         * in the result.
         *
         * @param {Object} obj1
         * @param {Object} obj2
         * @returns {Object}
         */
        function merge(obj1, obj2)
        {
            var result = {};

            for(var i in obj1)
            {
                result[i] = obj1[i];

                if((i in obj2) && (typeof obj1[i] === "object") && (i !== null))
                    result[i] = merge(obj1[i],obj2[i]);
            }

            for(var j in obj2)
            {
                if(j in result)
                    continue;

                result[j] = obj2[j];
            }

            return result;
        }

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
            config = merge(config, configuration);
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
    MachineStrategy.prototype.send = function($injector, machineConfiguration, message){};

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
     */
    SyncStrategy.prototype.send = function($injector, machineConfiguration, message)
    {
        if(machineConfiguration.getMessages().indexOf(message) >= 0)
        {
            var transitions = machineConfiguration.getTransitions();

            if(transitions.hasOwnProperty(this.current.name))
            {
                var edges = transitions[this.current.name];
                if(edges.hasOwnProperty(message))
                {
                    var states = machineConfiguration.getStates();
                    var state = states[edges[message]];
                    state.target = $injector.invoke(state.action, this, this.current);
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
     */
    AsyncStrategy.prototype.send = function($injector, machineConfiguration, message)
    {
        if(null !== this.promise)
        {
            var deferred = this.q.defer();

            this.promise.then(function()
            {
                deferred.resolve(SyncStrategy.prototype.send($injector, machineConfiguration, message));
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
         */
        this.send = function(message)
        {
            strategy.send($injector, machineConfiguration, message);
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
    this.$get = ['$injector', '$http', '$q', function($injector, $http, $q)
    {
        var strategy = (_async ? new AsyncStrategy($http, $q) : new SyncStrategy());

        return new StateMachine($injector, strategy, new MachineConfiguration(_config, _json));
    }];
});