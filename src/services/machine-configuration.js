'use strict';

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
