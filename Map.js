var RegionMap = /** @class */ (function () {
    function RegionMap() {
    }
    RegionMap.prototype.Link = function (loc1, loc2, oneWay) {
        if (oneWay === void 0) { oneWay = false; }
        this.AllLocations[loc1].LinkedLocation = loc2;
        if (!oneWay)
            this.AllLocations[loc2].LinkedLocation = loc1;
    };
    RegionMap.prototype.Load = function (data) {
        this.AllLocations = [];
        this.Hubs = [];
        this.Title = data.Region;
        for (var _i = 0, _a = data.Locations; _i < _a.length; _i++) {
            var loc = _a[_i];
            this.AllLocations.push({ Name: loc.Name, LinkedLocation: -1, BlockedBy: "" });
        }
        this.Hubs = data.Hubs;
    };
    return RegionMap;
}());
//# sourceMappingURL=Map.js.map