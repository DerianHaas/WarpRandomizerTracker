var NoLocation = -1;
var DeadEnd = -2;
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
            this.AllLocations.push({ Name: loc.Name, LinkedLocation: NoLocation, BlockedBy: "" });
        }
        this.Hubs = data.Hubs;
    };
    RegionMap.prototype.DrawHubSelector = function () {
        var container = $("<div>");
        for (var i = 0; i < this.Hubs.length; i++) {
            $("<div>").data("id", i).text(this.Hubs[i].Name).addClass("hubButton").appendTo(container);
        }
        return container;
    };
    RegionMap.prototype.DrawHub = function (hubId) {
        var hub = this.Hubs[hubId];
        var box = $("<div>");
        var header = $("<h1 style='text-align:center'>").text(hub.Name);
        box.append(header);
        if (hub.Locations.length > 0) {
            var table = $("<table>").addClass("tableBorder");
            for (var _i = 0, _a = hub.Locations; _i < _a.length; _i++) {
                var locId = _a[_i];
                var loc = this.AllLocations[locId];
                var row = $("<tr>");
                row.append($("<td>").text(loc.Name).addClass("connected"));
                row.append($("<td>").text(this.getLinkedLocationName(loc)).addClass(this.getLocationStyling(loc)));
                table.append(row);
            }
            box.append(table);
        }
        return box;
    };
    RegionMap.prototype.DrawHubImage = function (hubId) {
        var hub = this.Hubs[hubId];
        if (!hub.ImageName) {
            return null;
        }
        var imagePath = "images/" + hub.ImageName;
        return $("<img src=" + imagePath + ">").on("load", function () {
            $(this).width("50vh").height("50vh");
        });
    };
    RegionMap.prototype.getLinkedLocationName = function (loc) {
        if (loc.LinkedLocation === NoLocation) {
            return " - ";
        }
        if (loc.LinkedLocation === DeadEnd) {
            return "Dead End";
        }
        return this.AllLocations[loc.LinkedLocation].Name;
    };
    RegionMap.prototype.getLocationStyling = function (loc) {
        if (loc.LinkedLocation === NoLocation) {
            return "";
        }
        else if (loc.LinkedLocation === DeadEnd) {
            return "deadEnd";
        }
        if (!loc.BlockedBy) {
            return "connected";
        }
        //Handle blocks
        return "";
    };
    return RegionMap;
}());
//# sourceMappingURL=map.js.map