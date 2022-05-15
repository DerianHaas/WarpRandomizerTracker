$(function () {
    var parsedFiles = {};
    var files = [];
    var blockages = {
        "hgss": ["Trainer", "Flash", "Rock Smash", "Cut", "Bike", "Strength", "Surf", "Whirlpool", "Waterfall", "Rock Climb", "Power Plant", "Event"],
        "emerald": ["Trainer", "Rock Smash", "Bike", "Strength", "Surf", "Waterfall", "Dive", "Event"]
    };
    var regionNames = {
        "hgss": "johto",
        "emerald": "hoenn"
    };
    var GAME_TO_IMPORT = "emerald";
    $.get("import/" + GAME_TO_IMPORT + "/hubs.txt", function (fileData) {
        files = fileData.split("\n");
        files = files.filter(function (file) { return file.trim() !== ""; });
        files.forEach(function (hubData, i) {
            var hubInfo = hubData.trim().split(",");
            var file = hubInfo[0];
            if (!file)
                return;
            $.get("import/" + GAME_TO_IMPORT + "/" + file + ".txt", function (locData) {
                var locs = locData.trim().split("\n");
                locs = locs.map(function (loc) { return loc.trim(); });
                parsedFiles[file] = {
                    hubName: locs[0],
                    locNames: locs.slice(1)
                };
            }, "text");
        });
    }, "text");
    $(document).ajaxStop(function () {
        if (files.length > 0 && Object.keys(parsedFiles).length === files.length) {
            var mapData_1 = { Region: regionNames[GAME_TO_IMPORT], Hubs: [], Locations: [], Blockages: [] };
            var placeIndex_1 = 0;
            files.forEach(function (hubData) {
                var hubInfo = hubData.trim().split(",");
                var file = hubInfo[0];
                var image = hubInfo.length > 1 ? hubInfo[1] : "";
                var newHubLocs = [];
                parsedFiles[file].locNames.forEach(function (loc, i) {
                    if (loc === "") {
                        newHubLocs.push(NoLocation);
                    }
                    else {
                        newHubLocs.push(placeIndex_1);
                        mapData_1.Locations[placeIndex_1++] = { Name: loc };
                    }
                });
                mapData_1.Hubs.push({ Name: parsedFiles[file].hubName, Locations: newHubLocs, ImageName: image ? GAME_TO_IMPORT + "/" + image : "" });
            });
            mapData_1.Blockages = blockages[GAME_TO_IMPORT];
            console.log(mapData_1);
        }
    });
});
//# sourceMappingURL=import.js.map