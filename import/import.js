$(function () {
    fetch("import/input.json").then(function (response) { return response.json(); }).then(function (data) {
        var mapData = data;
        //console.log(mapData);
        $.get("import/import.txt", function (data) {
            var locs = data.split("\n");
            locs = locs.map(function (loc) { return loc.trim(); });
            console.log(locs);
            var placeIndex = mapData.Locations.length;
            var newHubLocs = [];
            for (var i = 1; i < locs.length; i++) {
                if (locs[i] === "") {
                    newHubLocs.push(NoLocation);
                }
                else {
                    mapData.Locations.push({ Name: locs[i] });
                    newHubLocs.push(placeIndex++);
                }
            }
            mapData.Hubs.push({ Name: locs[0], Locations: newHubLocs, ImageName: "" });
            console.log(mapData);
        }, "text");
    });
});
//# sourceMappingURL=import.js.map