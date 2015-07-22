'use strict';

/**
 * Defines the base class to represent a machine core strategy.
 * The machine strategy is the way how the machine itself resolves
 * the transitions to go ahead state by state.
 *
 * @constructor
 */
function MachineStrategy(){}

MachineStrategy.prototype.initialize = function(machineConfiguration){};
MachineStrategy.prototype.getStates = function(machineConfiguration){};
MachineStrategy.prototype.getMessages = function(machineConfiguration){};
MachineStrategy.prototype.hasMessage = function(machineConfiguration, message){};
MachineStrategy.prototype.isAvailable = function(machineConfiguration, message){};
MachineStrategy.prototype.available = function(machineConfiguration){};
MachineStrategy.prototype.send = function($q, $injector, machineConfiguration, message, parameters){};
