var NoLocation = -1;
var DeadEnd = -2;
var NoBlock = -1;
var OneWayBlock = -1;
var blockageColors = {
    "Trainer": {
        bkg: "orangered",
        text: "white"
    },
    "Rock Smash": {
        bkg: "brown",
        text: "white"
    },
    "Cut": {
        bkg: "darkgreen",
        text: "white"
    },
    "Bike": {
        bkg: "lightpink"
    },
    "Strength": {
        bkg: "gold"
    },
    "Surf": {
        bkg: "lightblue"
    },
    "Rock Climb": {
        bkg: "mediumpurple"
    },
    "Waterfall": {
        bkg: "darkblue",
        text: "white"
    },
    "Event": {
        bkg: "purple",
        text: "white"
    },
    "One Way": {
        bkg: "gray"
    },
    "Other": {
        bkg: "lightgray"
    },
    "Whirlpool": {
        bkg: "skyblue"
    },
    "Flash": {
        bkg: "lightgoldenrodyellow"
    },
    "Power Plant": {
        bkg: "sandybrown"
    },
    "Dive": {
        bkg: "skyblue"
    }
};
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
    RegionMap.prototype.Link = function (locId1, locId2, oneWay, notes) {
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
        loc1.Notes = notes;
        loc2.Notes = notes;
        this.saveToLocalStorage();
        return true;
    };
    RegionMap.prototype.MarkBlockage = function (locId, block, notes) {
        var loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as blocked?")) {
                return false;
            }
            this.ClearLink(loc.LinkedLocation);
        }
        loc.LinkedLocation = NoLocation;
        loc.BlockedBy = block;
        loc.Notes = notes;
        this.saveToLocalStorage();
        return true;
    };
    RegionMap.prototype.MarkDeadEnd = function (locId, notes) {
        var loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as a dead end?")) {
                return false;
            }
            this.ClearLink(loc.LinkedLocation);
        }
        loc.LinkedLocation = DeadEnd;
        loc.BlockedBy = NoBlock;
        loc.Notes = notes;
        this.saveToLocalStorage();
        return true;
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
                    var entranceItem = $("<td>").data("id", locId).text(loc.Name).addClass("entrance").attr("title", "ID: " + locId);
                    var destinationItem = $("<td>").text(this.getLinkedLocationName(loc)).css(this.getLocationStyling(loc));
                    if (loc.LinkedLocation > NoLocation) {
                        destinationItem.data("id", loc.LinkedLocation).addClass("destination").attr("title", "ID: " + this.AllLocations[locId].LinkedLocation);
                        ;
                    }
                    row.append([entranceItem, destinationItem]);
                }
                else {
                    row = row.addClass("emptyRow");
                }
                table.append(row);
            }
            box.append(table);
        }
        return box;
    };
    RegionMap.prototype.DrawBlockages = function () {
        var container = $("<div>");
        container.append($("<label>").addClass("blockageLabel").append([$("<input>").attr("type", "radio").attr("name", "blockage").attr("value", NoBlock).attr("id", "defaultBlockage"), $("<span>").text("None")]));
        this.RegionBlockageTypes.forEach(function (blockName, i) {
            var option = $("<label>").addClass("blockageLabel").css({
                "font-weight": "bold", "background-color": blockageColors[blockName].bkg || "white", "color": blockageColors[blockName].text || "black"
            });
            option.append($("<input>").attr("type", "radio").attr("name", "blockage").attr("value", i));
            option.append($("<span>").text(blockName));
            container.append(option);
        });
        return container;
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
            if (locId !== NoLocation)
                this.ClearLink(locId);
        }
        this.saveToLocalStorage();
    };
    RegionMap.prototype.ResetAll = function () {
        for (var locId = 0; locId < this.AllLocations.length; locId++) {
            this.ClearLink(locId);
        }
        this.saveToLocalStorage();
    };
    RegionMap.prototype.FindHub = function (locId) {
        return this.Hubs.findIndex(function (hub) { return hub.Locations.includes(locId); });
    };
    RegionMap.prototype.Load = function (region) {
        var _this = this;
        if (!$("#forceFileLoad").prop("checked") && this.loadFromLocalStorage(region)) {
            return Promise.resolve();
        }
        return fetch("worlds/" + region + ".json").then(function (response) { return response.json(); }).then(function (data) {
            _this.AllLocations = [];
            _this.Hubs = [];
            _this.Title = data.Region;
            _this.Hubs = data.Hubs;
            _this.RegionBlockageTypes = data.Blockages;
            if (!_this.RegionBlockageTypes.includes("One Way")) {
                OneWayBlock = _this.RegionBlockageTypes.length;
                _this.RegionBlockageTypes.push("One Way");
            }
            if (!_this.RegionBlockageTypes.includes("Other")) {
                _this.RegionBlockageTypes.push("Other");
            }
            for (var _i = 0, _a = data.Locations; _i < _a.length; _i++) {
                var loc = _a[_i];
                var defaultBlock = NoBlock;
                if (loc.BlockedBy) {
                    defaultBlock = _this.RegionBlockageTypes.indexOf(loc.BlockedBy);
                }
                _this.AllLocations.push({ Name: loc.Name, LinkedLocation: NoLocation, BlockedBy: defaultBlock });
            }
        });
    };
    RegionMap.prototype.getLinkedLocationName = function (loc) {
        var linkName = "";
        if (loc.LinkedLocation === NoLocation && loc.BlockedBy === NoBlock) {
            return " - ";
        }
        else if (loc.LinkedLocation === DeadEnd) {
            linkName = "Dead End";
        }
        else if (loc.BlockedBy === OneWayBlock) {
            linkName = "One Way from " + this.AllLocations[loc.LinkedLocation].Name;
        }
        else if (loc.BlockedBy === NoBlock) {
            linkName = this.AllLocations[loc.LinkedLocation].Name;
        }
        else {
            linkName = this.RegionBlockageTypes[loc.BlockedBy];
        }
        if (loc.Notes) {
            linkName += " (" + loc.Notes + ")";
        }
        return linkName;
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
        var blockageName = this.RegionBlockageTypes[loc.BlockedBy];
        return { "font-weight": "bold", "background-color": blockageColors[blockageName].bkg || "white", "color": blockageColors[blockageName].text || "black" };
    };
    RegionMap.prototype.saveToLocalStorage = function () {
        this.CustomNotes = $("#customNotes").val().toString();
        var mapJSON = { Region: this.Title, Hubs: this.Hubs, Locations: this.AllLocations, Blockages: this.RegionBlockageTypes, CustomNotes: this.CustomNotes };
        localStorage.setItem("warpMap-" + this.Title, JSON.stringify(mapJSON));
    };
    RegionMap.prototype.loadFromLocalStorage = function (region) {
        var localData = localStorage.getItem("warpMap-" + region);
        if (!localData)
            return false;
        var mapJSON = JSON.parse(localData);
        this.Title = mapJSON.Region;
        this.AllLocations = mapJSON.Locations;
        this.Hubs = mapJSON.Hubs;
        this.RegionBlockageTypes = mapJSON.Blockages;
        OneWayBlock = this.RegionBlockageTypes.indexOf("One Way");
        this.CustomNotes = mapJSON.CustomNotes;
        return true;
    };
    return RegionMap;
}());
//# sourceMappingURL=map.js.map