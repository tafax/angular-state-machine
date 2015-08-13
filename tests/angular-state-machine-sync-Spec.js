'use strict';

describe('angular-state-machine-sync', function() {

    // The state machine service.
    var _stateMachine;
    // The rootScope
    var _rootScope;
    // The injector service.
    var _injector;

    var _params = {
        test: 'test'
    };

    beforeEach(angular.mock.module('FSM'));

    beforeEach(function() {
        var fakeModule = angular.module('test.config', []);
        fakeModule.config(['stateMachineProvider', function(stateMachineProvider) {
            // Configures the state machine.
            stateMachineProvider.config({
                init: {
                    transitions: {
                        first: 'first',
                        four: 'four',
                        reject: 'reject'
                    }
                },
                first: {
                    transitions: {
                        second: 'second'
                    },
                    action: function(name) {
                        console.log('FIRST');
                        expect(name).toEqual('init');
                        return _params;
                    }
                },
                second: {
                    transitions: {
                        third: [{
                            to: 'third',
                            predicate: function()
                            {
                                return true;
                            }
                        }]
                    },
                    action: ['$log', 'stateMachine', 'name', 'params', function($log, stateMachine, name, params) {
                        console.log('SECOND');
                        expect(stateMachine).not.toBeUndefined();
                        expect($log).not.toBeUndefined();
                        expect(name).toEqual('first');
                        expect(params).toEqual(_params);

                        params.second = 'second';

                        return params;
                    }]
                },
                third: {
                    action: function(params) {
                        console.log('THIRD');

                        _params.second = 'second';
                        _params.param = 'test';

                        expect(params).toEqual(_params);
                    }
                },
                four: {},
                reject: {
                    action: ['$q', function($q) {
                        var deferred = $q.defer();
                        deferred.reject();
                        return deferred.promise;
                    }]
                }
            });
        }]);

        module('FSM', 'test.config');

        inject(function($injector) {
            _stateMachine = $injector.get('stateMachine');
            _rootScope = $injector.get('$rootScope');
            _injector = $injector;
            spyOn(_injector, 'invoke').and.callThrough();
        });
    });

    describe('ALL', function() {
        it('should change the state when sending correct message', function() {
            _stateMachine.initialize();

            _stateMachine.send('first');
            _stateMachine.send('second');
            _stateMachine.send('third', {param: 'test'});
            _rootScope.$digest();
            expect(_injector.invoke).toHaveBeenCalled();
        });

        it('should not change the state when sending incorrect message', function() {
            _stateMachine.initialize();

            _stateMachine.send('fake');
            _rootScope.$digest();
            expect(_injector.invoke).not.toHaveBeenCalled();
        });

        it('should return the states', function() {
            _stateMachine.initialize();

            var states = _stateMachine.getStates();

            expect(states).toContain('init');
            expect(states).toContain('first');
            expect(states).toContain('second');
            expect(states).not.toContain('fake');
        });

        it('should return the messages', function() {
            _stateMachine.initialize();

            var messages = _stateMachine.getMessages();

            expect(messages).toContain('first');
            expect(messages).toContain('second');
            expect(messages).not.toContain('fake');
        });

        it('should return true for the specific message', function() {
            _stateMachine.initialize();

            expect(_stateMachine.hasMessage('first')).toBeTruthy();
            expect(_stateMachine.hasMessage('second')).toBeTruthy();
            expect(_stateMachine.hasMessage('fake')).toBeFalsy();
        });

        it('should return true if the message is available for current state', function() {
            _stateMachine.initialize();

            _stateMachine.isAvailable('first').then(function(available){
                // Expectation.
                expect(available).toBeTruthy();
            });
            _stateMachine.isAvailable('second').then(function(available){
                // Expectation.
                expect(available).toBeFalsy();
            });
            _stateMachine.isAvailable('fake').then(function(available){
                // Expectation.
                expect(available).toBeFalsy();
            });

            _stateMachine.send('first');

            _stateMachine.isAvailable('first').then(function(available){
                // Expectation.
                expect(available).toBeFalsy();
            });
            _stateMachine.isAvailable('second').then(function(available){
                // Expectation.
                expect(available).toBeTruthy();
            });
            _stateMachine.isAvailable('fake').then(function(available){
                // Expectation.
                expect(available).toBeFalsy();
            });

            _rootScope.$digest();
        });

        it('should return the messages available in the current state', function() {
            _stateMachine.initialize();

            _stateMachine.available().then(function(messages){
                // Expectations.
                expect(messages).toContain('first');
                expect(messages).not.toContain('fake');
            });

            _stateMachine.send('first');
            _rootScope.$digest();

            _stateMachine.available().then(function(messages){
                // Expectations.
                expect(messages).toContain('second');
                expect(messages).not.toContain('fake');
            });

            _stateMachine.send('second');
            _rootScope.$digest();

            _stateMachine.available().then(function(messages){
                // Expectations.
                expect(messages).toContain('third');
                expect(messages).not.toContain('fake');
            });

            _stateMachine.send('third', {param: 'test'});
            _rootScope.$digest();

            _stateMachine.available().then(function(messages){
                // Expectations.
                expect(messages.length).toEqual(0);
            });
        });

        it('should return the current promise', function() {
            _stateMachine.initialize();

            var successCallback = jasmine.createSpy('successCallback');

            _stateMachine.send('first').then(successCallback);
            _rootScope.$digest();

            // Expectation.
            expect(successCallback).toHaveBeenCalled();
        });

        it('should return the current promise and call rejection', function() {
            _stateMachine.initialize();

            var successCallback = jasmine.createSpy('successCallback');
            var errorCallback = jasmine.createSpy('errorCallback');

            _stateMachine.send('reject')
              .then(successCallback)
              .catch(errorCallback);
            _rootScope.$digest();

            // Expectation.
            expect(successCallback).not.toHaveBeenCalled();
            expect(errorCallback).toHaveBeenCalled();
        });

        it('should return the current promise and call rejection if the message doesn\'t exist', function() {
            _stateMachine.initialize();

            var successCallbackFirst = jasmine.createSpy('successCallbackFirst');
            var errorCallbackFirst = jasmine.createSpy('errorCallbackFirst');

            _stateMachine.send('fake')
              .then(successCallbackFirst)
              .catch(errorCallbackFirst);
            _rootScope.$digest();

            var successCallbackSecond = jasmine.createSpy('successCallbackSecond');
            var errorCallbackSecond = jasmine.createSpy('errorCallbackSecond');

            _stateMachine.send('first')
              .then(successCallbackSecond)
              .catch(errorCallbackSecond);
            _rootScope.$digest();

            // Expectation.
            expect(successCallbackFirst).not.toHaveBeenCalled();
            expect(errorCallbackFirst).toHaveBeenCalled();
            expect(successCallbackSecond).toHaveBeenCalled();
            expect(errorCallbackSecond).not.toHaveBeenCalled();
        });

        it('should return the current promise and call rejection if the message is not available', function() {
            _stateMachine.initialize();

            var successCallbackFirst = jasmine.createSpy('successCallbackFirst');
            var errorCallbackFirst = jasmine.createSpy('errorCallbackFirst');

            _stateMachine.send('second')
              .then(successCallbackFirst)
              .catch(errorCallbackFirst);
            _rootScope.$digest();

            var successCallbackSecond = jasmine.createSpy('successCallbackSecond');
            var errorCallbackSecond = jasmine.createSpy('errorCallbackSecond');

            _stateMachine.send('first')
              .then(successCallbackSecond)
              .catch(errorCallbackSecond);
            _rootScope.$digest();

            // Expectation.
            expect(successCallbackFirst).not.toHaveBeenCalled();
            expect(errorCallbackFirst).toHaveBeenCalled();
            expect(successCallbackSecond).toHaveBeenCalled();
            expect(errorCallbackSecond).not.toHaveBeenCalled();
        });

        it('should return the current state name', function() {
            _stateMachine.initialize();

            _stateMachine.send('first');
            _stateMachine.getCurrentState().then(function(name){
                // Expectation.
                expect(name).toEqual('first');
            });
            _rootScope.$digest();
        });

        it('should return the current state name if the action is rejected', function() {
            _stateMachine.initialize();

            _stateMachine.send('reject');
            _stateMachine.getCurrentState().then(function(name){
                // Expectation.
                expect(name).toEqual('init');
            });
            _rootScope.$digest();

            _stateMachine.send('first');
            _stateMachine.getCurrentState().then(function(name){
                // Expectation.
                expect(name).toEqual('first');
            });
            _rootScope.$digest();
        });

        it('should move to a state without action', function() {
            _stateMachine.initialize();

            _stateMachine.send('four');
            _rootScope.$digest();

            _stateMachine.getCurrentState().then(function(name){
                // Expectation.
                expect(name).toEqual('four');
            });
        });

        it('should execute sequential sends', function() {
            _stateMachine.initialize();

            _stateMachine.send('first');
            _stateMachine.getCurrentState().then(function(name){
                // Expectation.
                expect(name).toEqual('first');
            });
            _stateMachine.send('second');
            _stateMachine.getCurrentState().then(function(name){
                // Expectation.
                expect(name).toEqual('second');
            });
            _rootScope.$digest();
        });
    });
});
