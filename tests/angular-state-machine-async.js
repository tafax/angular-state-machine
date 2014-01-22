describe('angular-state-machine-async', function()
{
    var _httpBackend;
    var _stateMachine;
    var _injector;

    var _target = {
        test: 'test'
    };

    var _config = {
        init: {
            transitions: {
                first: 'first'
            }
        },
        first: {
            transitions: {
                second: 'second'
            }
        },
        second: {
        }
    };

    beforeEach(angular.mock.module('FSM'));

    beforeEach(function()
    {
        var fakeModule = angular.module('test.config', []);
        fakeModule.config(['stateMachineProvider', function(stateMachineProvider)
        {
            stateMachineProvider.load('machine.json');

            stateMachineProvider.config({
                first: {
                    action: function(name)
                    {
                        console.log('FIRST');
                        expect(name).toEqual('init');
                        return _target;
                    }
                },
                second: {
                    action: ['$log', 'stateMachine', 'name', 'target', function($log, stateMachine, name, target)
                    {
                        console.log('SECOND');
                        expect(stateMachine).not.toBeUndefined();
                        expect($log).not.toBeUndefined();
                        expect(name).toEqual('first');
                        expect(target).toEqual(_target);
                    }]
                }
            });
        }]);

        module('FSM', 'test.config');

        inject(function($injector)
        {
            _stateMachine = $injector.get('stateMachine');
            _httpBackend = $injector.get('$httpBackend');

            _injector = $injector;
            spyOn(_injector, 'invoke').andCallThrough();

            _httpBackend.whenGET('file://machine.json').respond(function()
            {
                return [200, angular.toJson(_config), ''];
            });
        });
    });

    afterEach(function()
    {
        _httpBackend.verifyNoOutstandingExpectation();
        _httpBackend.verifyNoOutstandingRequest();
    });

    describe('ALL', function()
    {
        it('should change the state when sending correct message', function()
        {
            _stateMachine.initialize();

            _stateMachine.send('first');

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            _stateMachine.send('second');

            expect(_injector.invoke).toHaveBeenCalled();
        });

        it('should not change the state when sending incorrect message', function()
        {
            _stateMachine.initialize();

            _stateMachine.send('fake');

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            expect(_injector.invoke).not.toHaveBeenCalled();
        });

        it('should return the states', function()
        {
            _stateMachine.initialize();

            _stateMachine.getStates().then(function(states)
            {
                expect(states).toContain('init');
                expect(states).toContain('first');
                expect(states).toContain('second');
                expect(states).not.toContain('fake');
            });

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            _stateMachine.getStates().then(function(states)
            {
                expect(states).toContain('init');
                expect(states).toContain('first');
                expect(states).toContain('second');
                expect(states).not.toContain('fake');
            });
        });

        it('should return the messages', function()
        {
            _stateMachine.initialize();

            _stateMachine.getMessages().then(function(messages)
            {
                expect(messages).toContain('first');
                expect(messages).toContain('second');
                expect(messages).not.toContain('fake');
            });

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            _stateMachine.getMessages().then(function(messages)
            {
                expect(messages).toContain('first');
                expect(messages).toContain('second');
                expect(messages).not.toContain('fake');
            });
        });

        it('should return true for the specific message', function()
        {
            _stateMachine.initialize();

            _stateMachine.hasMessage('first').then(function(result)
            {
                expect(result).toBeTruthy();
            });

            _stateMachine.hasMessage('second').then(function(result)
            {
                expect(result).toBeTruthy();
            });

            _stateMachine.hasMessage('fake').then(function(result)
            {
                expect(result).not.toBeTruthy();
            });

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            _stateMachine.hasMessage('first').then(function(result)
            {
                expect(result).toBeTruthy();
            });

            _stateMachine.hasMessage('second').then(function(result)
            {
                expect(result).toBeTruthy();
            });

            _stateMachine.hasMessage('fake').then(function(result)
            {
                expect(result).not.toBeTruthy();
            });
        });

        it('should return true if the message is available for current state', function()
        {
            _stateMachine.initialize();

            _stateMachine.isAvailable('first').then(function(result)
            {
                expect(result).toBeTruthy();
            });

            _stateMachine.isAvailable('second').then(function(result)
            {
                expect(result).toBeFalsy();
            });

            _stateMachine.isAvailable('fake').then(function(result)
            {
                expect(result).toBeFalsy();
            });

            _stateMachine.send('first');

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            _stateMachine.isAvailable('first').then(function(result)
            {
                expect(result).toBeFalsy();
            });

            _stateMachine.isAvailable('second').then(function(result)
            {
                expect(result).toBeTruthy();
            });

            _stateMachine.isAvailable('fake').then(function(result)
            {
                expect(result).toBeFalsy();
            });
        });

        it('should return the messages available in the current state', function()
        {
            _stateMachine.initialize();

            _stateMachine.available().then(function(messages)
            {
                expect(messages).toContain('first');
                expect(messages).not.toContain('fake');
            });

            _stateMachine.send('first');

            _httpBackend.expectGET('file://machine.json');
            _httpBackend.flush();

            _stateMachine.available().then(function(messages)
            {
                expect(messages).toContain('second');
                expect(messages).not.toContain('fake');
            });

            _stateMachine.send('second');

            _stateMachine.available().then(function(messages)
            {
                expect(messages.length).toEqual(0);
            });
        });
    });
});
