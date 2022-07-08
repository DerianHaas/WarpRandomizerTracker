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
            if (!version || version === hubVersion) {
                $.get("import/" + gameToImport + "/" + file + ".txt", function (locData) {
                    var locs = locData.trim().split("\n").map(function (loc) { return loc.trim(); });
                    parsedFiles[file] = {
                        hubName: locs[0],
                        locNames: locs.slice(1)
                    };
                }, "text");
            }
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
                if (!version || hubVersion === version) {
                    parsedFiles[file].locNames.forEach(function (locData) {
                        if (locData === "") {
                            newHubLocs.push(NoLocation);
                        }
                        else {
                            var _a = locData.split(","), locName = _a[0], blockage = _a[1], locVersion = _a[2];
                            if (!version || version === locVersion) {
                                var locIndex = void 0;
                                if (!(locName in locMap)) {
                                    locIndex = nextLoc_1;
                                    locMap[locName] = locIndex;
                                    var newLoc = { Name: locName };
                                    if (blockage) {
                                        newLoc.BlockedBy = blockage.trim();
                                    }
                                    mapData_1.Locations[nextLoc_1++] = newLoc;
                                }
                                else {
                                    locIndex = locMap[locName];
                                }
                                newHubLocs.push(locIndex);
                            }
                        }
                    });
                    mapData_1.Hubs.push({
                        Name: parsedFiles[file].hubName,
                        Locations: newHubLocs,
                        ImageName: image ? gameToImport + "/" + image : ""
                    });
                }
            });
            mapData_1.Blockages = blockages[gameToImport];
            console.log(mapData_1);
        }
    });
}
//# sourceMappingURL=import.js.map