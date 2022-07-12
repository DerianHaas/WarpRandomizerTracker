var parsedFiles;
var files;
var locMap;
var blockages = {
    "hgss": ["Trainer", "Flash", "Rock Smash", "Cut", "Bike", "Strength", "Surf", "Whirlpool", "Waterfall", "Rock Climb", "Power Plant", "Event"],
    "emerald": ["Trainer", "Cut", "Flash", "Bike", "Rock Smash", "Strength", "Surf", "Waterfall", "Dive", "Event"],
    "platinum": ["Trainer", "Rock Smash", "Cut", "Bike", "Surf", "Strength", "Rock Climb", "Waterfall", "Galactic Key", "Event"],
    "bw2": ["Trainer", "Cut", "Strength", "Surf", "Waterfall", "Dive", "Event"]
};
function doImport(gameToImport, version) {
    parsedFiles = {};
    files = [];
    locMap = {};
    $.get("import/" + gameToImport + "/hubs.txt", function (fileData) {
        files = fileData.split("\n");
        files = files.filter(function (file) { return file.trim() !== ""; });
        files.forEach(function (hubData) {
            var _a = hubData.trim().split(","), file = _a[0], image = _a[1], hubVersion = _a[2];
            if (!file)
                return;
            $.get("import/" + gameToImport + "/" + file + ".txt", function (locData) {
                var locs = locData.trim().split("\n").map(function (loc) { return loc.trim(); });
                parsedFiles[file] = {
                    hubName: locs[0],
                    locNames: locs.slice(1),
                };
            }, "text");
        });
    }, "text");
    $(document).off("ajaxStop");
    $(document).ajaxStop(function () {
        if (files.length > 0 && Object.keys(parsedFiles).length === files.length) {
            var mapData_1 = { Region: regionNames[gameToImport], Hubs: [], Locations: [], Blockages: [] };
            var nextLoc_1 = 0;
            files.forEach(function (hubData) {
                var _a = hubData.trim().split(","), file = _a[0], image = _a[1], hubVersion = _a[2];
                var newHubLocs = [];
                parsedFiles[file].locNames.forEach(function (locData) {
                    if (locData === "") {
                        newHubLocs.push(NoLocation);
                    }
                    else {
                        var _a = locData.split(","), locName = _a[0], blockage = _a[1], addlData = _a[2];
                        var locIndex = void 0;
                        if (!(locName in locMap)) {
                            locIndex = nextLoc_1;
                            locMap[locName] = locIndex;
                            var newLoc = { Name: locName };
                            if (blockage)
                                newLoc.BlockedBy = blockage.trim();
                            if (addlData) {
                                var extraData = parseExtraData(gameToImport, addlData);
                                if (extraData.version)
                                    newLoc.Version = extraData.version;
                                if (extraData.seasons)
                                    newLoc.Seasons = extraData.seasons;
                            }
                            mapData_1.Locations[nextLoc_1++] = newLoc;
                        }
                        else {
                            locIndex = locMap[locName];
                        }
                        newHubLocs.push(locIndex);
                    }
                });
                var newHub = {
                    Name: parsedFiles[file].hubName,
                    Locations: newHubLocs
                };
                if (image)
                    newHub.ImageName = gameToImport + "/" + image;
                if (hubVersion)
                    newHub.Version = hubVersion;
                mapData_1.Hubs.push(newHub);
            });
            mapData_1.Blockages = blockages[gameToImport];
            console.log(mapData_1);
        }
    });
}
function parseExtraData(gameToImport, extraData) {
    var parsedData = {};
    if (gameToImport === "bw2") {
        var _a = extraData.split("/"), version = _a[0], seasons = _a[1];
        if (version)
            parsedData.version = version;
        if (seasons)
            parsedData.seasons = seasons;
    }
    return parsedData;
}
//# sourceMappingURL=import.js.map