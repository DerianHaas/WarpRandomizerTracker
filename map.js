var NoLocation = -1;
var DeadEnd = -2;
var RegionMap = /** @class */ (function () {
    function RegionMap() {
    }
    RegionMap.prototype.Link = function (locId1, locId2, oneWay) {
        if (oneWay === void 0) { oneWay = false; }
        var loc1 = this.AllLocations[locId1];
        var loc2 = this.AllLocations[locId2];
        if ((loc1.LinkedLocation > NoLocation && loc1.LinkedLocation !== locId2) || (loc2.LinkedLocation > NoLocation && loc2.LinkedLocation !== locId1)) {
            if (!confirm("One of these locations is already linked to a different location.  Are you sure you want to overwrite it?")) {
                return false;
            }
        }
        loc1.LinkedLocation = locId2;
        if (!oneWay)
            loc2.LinkedLocation = locId1;
        return true;
    };
    RegionMap.prototype.MarkBlockage = function (locId, blocks) {
        var loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as blocked?")) {
                return false;
            }
            this.AllLocations[loc.LinkedLocation].LinkedLocation = NoLocation;
        }
        loc.LinkedLocation = NoLocation;
        loc.BlockedBy = blocks;
        return true;
    };
    RegionMap.prototype.MarkDeadEnd = function (locId) {
        var loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as a dead end?")) {
                return false;
            }
            this.AllLocations[loc.LinkedLocation].LinkedLocation = NoLocation;
        }
        loc.LinkedLocation = DeadEnd;
        loc.BlockedBy = "";
        return true;
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
            $("<div>").data("id", i).text(this.Hubs[i].Name).addClass("hubButton").attr("title", "ID: " + i).appendTo(container);
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
                row.append($("<td>").data("id", locId).text(loc.Name).addClass("entrance").attr("title", "ID: " + locId));
                row.append($("<td>").text(this.getLinkedLocationName(loc)).addClass(this.getLocationStyling(loc)).attr("title", "ID: " + this.AllLocations[locId].LinkedLocation));
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