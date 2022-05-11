var NoLocation = -1;
var DeadEnd = -2;
var NoBlock = -1;
var OneWayBlock = 9;
var blockTypes = [
    {
        name: "Trainer",
        bkgcolor: "orangered",
    },
    {
        name: "Rock Smash",
        bkgcolor: "brown",
        textcolor: "white"
    },
    {
        name: "Cut",
        bkgcolor: "darkgreen",
        textcolor: "white"
    },
    {
        name: "Bike",
        bkgcolor: "lightpink"
    },
    {
        name: "Strength",
        bkgcolor: "gold"
    },
    {
        name: "Surf",
        bkgcolor: "lightblue"
    },
    {
        name: "Rock Climb",
        bkgcolor: "mediumpurple"
    },
    {
        name: "Waterfall",
        bkgcolor: "darkblue",
        textcolor: "white"
    },
    {
        name: "Event",
        bkgcolor: "purple",
        textcolor: "white"
    },
    {
        name: "One Way",
        bkgcolor: "gray"
    }
];
var RegionMap = /** @class */ (function () {
    function RegionMap() {
    }
    RegionMap.prototype.ClearLink = function (locId) {
        var loc = this.AllLocations[locId];
        loc.BlockedBy = NoBlock;
        if (loc.LinkedLocation > NoLocation) {
            var linkedLoc = this.AllLocations[loc.LinkedLocation];
            linkedLoc.LinkedLocation = NoLocation;
            linkedLoc.BlockedBy = NoBlock;
        }
        loc.LinkedLocation = NoLocation;
    };
    RegionMap.prototype.Link = function (locId1, locId2, oneWay) {
        if (oneWay === void 0) { oneWay = false; }
        var loc1 = this.AllLocations[locId1];
        var loc2 = this.AllLocations[locId2];
        if ((loc1.LinkedLocation > NoLocation && loc1.LinkedLocation !== locId2) || (loc2.LinkedLocation > NoLocation && loc2.LinkedLocation !== locId1)) {
            if (!confirm("One of these locations is already linked to a different location.  Are you sure you want to overwrite it?")) {
                return false;
            }
        }
        this.ClearLink(locId1);
        this.ClearLink(locId2);
        loc1.LinkedLocation = locId2;
        loc2.LinkedLocation = locId1;
        loc2.BlockedBy = oneWay ? OneWayBlock : NoBlock;
        return true;
    };
    RegionMap.prototype.MarkBlockage = function (locId, block) {
        var loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as blocked?")) {
                return false;
            }
            this.ClearLink(loc.LinkedLocation);
        }
        loc.LinkedLocation = NoLocation;
        loc.BlockedBy = block;
        return true;
    };
    RegionMap.prototype.MarkDeadEnd = function (locId) {
        var loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as a dead end?")) {
                return false;
            }
            this.ClearLink(loc.LinkedLocation);
        }
        loc.LinkedLocation = DeadEnd;
        loc.BlockedBy = NoBlock;
        return true;
    };
    RegionMap.prototype.Load = function (data) {
        this.AllLocations = [];
        this.Hubs = [];
        this.Title = data.Region;
        for (var _i = 0, _a = data.Locations; _i < _a.length; _i++) {
            var loc = _a[_i];
            this.AllLocations.push({ Name: loc.Name, LinkedLocation: NoLocation, BlockedBy: NoBlock });
        }
        this.Hubs = data.Hubs;
    };
    RegionMap.prototype.DrawHubSelector = function () {
        var container = $("<div>").attr("id", "hubSelectContainer");
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
                var row = $("<tr>");
                if (locId !== NoLocation) {
                    var loc = this.AllLocations[locId];
                    row.append($("<td>").data("id", locId).text(loc.Name).addClass("entrance").attr("title", "ID: " + locId));
                    row.append($("<td>").text(this.getLinkedLocationName(loc)).css(this.getLocationStyling(loc)).attr("title", "ID: " + this.AllLocations[locId].LinkedLocation));
                }
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
            $(this).css({ "maxWidth": "25vw", "maxHeight": "60vh", "background-size": "cover" });
        });
    };
    RegionMap.prototype.DrawGrid = function () {
        var container = $("<div>").attr("id", "gridWrapper");
        for (var locId = 0; locId < this.AllLocations.length; locId++) {
            container.append($("<div>").data("id", locId).addClass("gridSquare").css(this.getLocationStyling(this.AllLocations[locId])));
        }
        return container;
    };
    RegionMap.prototype.ResetHub = function (hubId) {
        for (var _i = 0, _a = this.Hubs[hubId].Locations; _i < _a.length; _i++) {
            var locId = _a[_i];
            this.ClearLink(locId);
        }
    };
    RegionMap.prototype.ResetAll = function () {
        for (var locId = 0; locId < this.AllLocations.length; locId++) {
            this.ClearLink(locId);
        }
    };
    RegionMap.prototype.getLinkedLocationName = function (loc) {
        if (loc.LinkedLocation === NoLocation && loc.BlockedBy === NoBlock) {
            return " - ";
        }
        if (loc.LinkedLocation === DeadEnd) {
            return "Dead End";
        }
        if (loc.BlockedBy === OneWayBlock) {
            return "One Way (from " + this.AllLocations[loc.LinkedLocation].Name + ")";
        }
        if (loc.BlockedBy === NoBlock) {
            return this.AllLocations[loc.LinkedLocation].Name;
        }
        return blockTypes[loc.BlockedBy].name;
    };
    RegionMap.prototype.getLocationStyling = function (loc) {
        if (loc.LinkedLocation === NoLocation && loc.BlockedBy === NoBlock) {
            return { "font-weight": "bold" };
        }
        else if (loc.LinkedLocation === DeadEnd) {
            return { "font-weight": "bold", "background-color": "gray" };
        }
        if (loc.BlockedBy === NoBlock) {
            return { "font-weight": "bold", "background-color": "lightgreen" };
        }
        return { "font-weight": "bold", "background-color": blockTypes[loc.BlockedBy].bkgcolor, "color": blockTypes[loc.BlockedBy].textcolor || "black" };
    };
    return RegionMap;
}());
//# sourceMappingURL=map.js.map