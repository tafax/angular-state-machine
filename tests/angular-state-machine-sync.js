describe('angular-state-machine-sync', function()
{
    var _stateMachine;
    var _injector;

    var _target = {
        test: 'test'
    };

    beforeEach(angular.mock.module('FSM'));

    beforeEach(function()
    {
        var fakeModule = angular.module('test.config', []);
        fakeModule.config(['stateMachineProvider', function(stateMachineProvider)
        {
            stateMachineProvider.config({
                init: {
                    transitions: {
                        first: 'first'
                    }
                },
                first: {
                    transitions: {
                        second: 'second'
                    },
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

            _injector = $injector;
            spyOn(_injector, 'invoke').andCallThrough();
        });
    });

    describe('ALL', function()
    {
        it('should change the state when sending correct message', function()
        {
            _stateMachine.initialize();

            _stateMachine.send('first');

            _stateMachine.send('second');

            expect(_injector.invoke).toHaveBeenCalled();
        });

        it('should not change the state when sending incorrect message', function()
        {
            _stateMachine.initialize();

            _stateMachine.send('fake');

            expect(_injector.invoke).not.toHaveBeenCalled();
        });

        it('should return the states', function()
        {
            _stateMachine.initialize();

            var states = _stateMachine.getStates();

            expect(states).toContain('init');
            expect(states).toContain('first');
            expect(states).toContain('second');
            expect(states).not.toContain('fake');
        });

        it('should return the messages', function()
        {
            _stateMachine.initialize();

            var messages = _stateMachine.getMessages();

            expect(messages).toContain('first');
            expect(messages).toContain('second');
            expect(messages).not.toContain('fake');
        });

        it('should return true for the specific message', function()
        {
            _stateMachine.initialize();

            expect(_stateMachine.hasMessage('first')).toBeTruthy();
            expect(_stateMachine.hasMessage('second')).toBeTruthy();
            expect(_stateMachine.hasMessage('fake')).toBeFalsy();
        });

        it('should return true if the message is available for current state', function()
        {
            _stateMachine.initialize();

            expect(_stateMachine.isAvailable('first')).toBeTruthy();
            expect(_stateMachine.isAvailable('second')).toBeFalsy();
            expect(_stateMachine.isAvailable('fake')).toBeFalsy();

            _stateMachine.send('first');

            expect(_stateMachine.isAvailable('first')).toBeFalsy();
            expect(_stateMachine.isAvailable('second')).toBeTruthy();
            expect(_stateMachine.isAvailable('fake')).toBeFalsy();
        });

        it('should return the messages available in the current state', function()
        {
            _stateMachine.initialize();

            var messages = _stateMachine.available();

            expect(messages).toContain('first');
            expect(messages).not.toContain('fake');

            _stateMachine.send('first');

            messages = _stateMachine.available();

            expect(messages).toContain('second');
            expect(messages).not.toContain('fake');

            _stateMachine.send('second');

            messages = _stateMachine.available();

            expect(messages.length).toEqual(0);
        });
    });
});
