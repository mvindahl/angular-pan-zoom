describe('PanZoomService spec', function () {
    var $rootScope,
        PanZoomService;

    beforeEach(module('testApp'))
    beforeEach(inject(function (_$rootScope_, _PanZoomService_) {
        $rootScope = _$rootScope_;
        PanZoomService = _PanZoomService_;
    }));

    it('should return a promise', function () {
        expect(PanZoomService.getAPI('theKey').then).toBeDefined();
    });

    it('should work when the API is registered before it is requested', function () {
        var theAPI = 'theAPI',
            gotValue;
        PanZoomService.registerAPI('theKey', theAPI);
        PanZoomService.getAPI('theKey').then(function (value) {
            expect(value).toBe(theAPI);
            gotValue = true;
        });
        $rootScope.$digest(); // trigger promise propagation
        expect(gotValue).toBe(true);
    });

    it('should work when the API is requested before it is registered', function () {
        var theAPI = 'theAPI',
            gotValue;
        PanZoomService.getAPI('theKey').then(function (value) {
            expect(value).toBe(theAPI);
            gotValue = true;
        });
        PanZoomService.registerAPI('theKey', theAPI);
        $rootScope.$digest(); // trigger promise propagation
        expect(gotValue).toBe(true);
    });

    it('should permit multiple APIs to be registered', function () {
        var someAPI = 'someAPI',
            someOtherAPI = 'someOtherAPI';
        PanZoomService.registerAPI('someKey', someAPI);
        PanZoomService.registerAPI('someOtherKey', someOtherAPI);
        PanZoomService.getAPI('someKey').then(function (value) {
            expect(value).toBe(someAPI);
        });
        PanZoomService.getAPI('someOtherKey').then(function (value) {
            expect(value).toBe(someOtherAPI);
        });
        $rootScope.$digest(); // trigger promise propagation
    });

    it('should throw an error if the same key is used for registering twice', function () {
        var caughtError;
        try {
            PanZoomService.registerAPI('theKey', {});
            PanZoomService.registerAPI('theKey', {});
        } catch (err) {
            caughtError = err;
        }
        expect(caughtError).toBeDefined();
    });

    it('should permit multiple lookups by the same key', function () {
        PanZoomService.getAPI('theKey');
        PanZoomService.getAPI('theKey');
    });

    it('should allow APIs to be unregistered', function () {
        var _this = this;
        var theAPI = 'theAPI';
        PanZoomService.registerAPI('theKey', theAPI);
        PanZoomService.unregisterAPI('theKey');
        PanZoomService.getAPI('theKey').then(function (value) {
            this.fail(Error('Failed to unregister API'));
        });
    });
});