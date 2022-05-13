$(function () {
    $.get("import/hgss/hubs.txt", function (fileData) {
        var files = fileData.split("\n");
        var mapData = { Region: "johto", Hubs: [], Locations: [], Blockages: [] };
        var placeIndex = 0;
        files = files.filter(function (file) { return file.trim() !== ""; });
        files.forEach(function (hubData, i) {
            var hubInfo = hubData.trim().split(",");
            var file = hubInfo[0];
            var image = hubInfo.length > 1 ? hubInfo[1] : "";
            if (!file)
                return;
            $.get("import/hgss/" + file + ".txt", function (locData) {
                var locs = locData.trim().split("\n");
                locs = locs.map(function (loc) { return loc.trim(); });
                var newHubLocs = [];
                for (var i_1 = 1; i_1 < locs.length; i_1++) {
                    if (locs[i_1] === "") {
                        newHubLocs.push(NoLocation);
                    }
                    else {
                        newHubLocs.push(placeIndex);
                        mapData.Locations[placeIndex++] = { Name: locs[i_1] };
                    }
                }
                mapData.Hubs[i] = { Name: locs[0], Locations: newHubLocs, ImageName: image ? "hgss/" + image : "" };
            }, "text");
        });
        mapData.Blockages = ["Trainer", "Flash", "Rock Smash", "Cut", "Bike", "Strength", "Surf", "Whirlpool", "Waterfall", "Rock Climb", "Event"];
        console.log(mapData);
    }, "text");
});
//# sourceMappingURL=import.js.map