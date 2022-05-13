$(() => {

    $.get("import/hgss/hubs.txt", function (fileData) {
        let files: string[] = fileData.split("\n");

        let mapData: MapJSON = { Region: "johto", Hubs: [], Locations: [], Blockages: [] };
        let placeIndex = 0;
        files = files.filter(file => file.trim() !== "");
        files.forEach((hubData, i) => {
            let hubInfo: string[] = hubData.trim().split(",");
            let file = hubInfo[0];
            let image = hubInfo.length > 1 ? hubInfo[1] : "";
            if (!file) return;
            $.get("import/hgss/" + file + ".txt", function (locData) {
                let locs: string[] = locData.trim().split("\n");
                locs = locs.map(loc => loc.trim());

                let newHubLocs = [];
                for (let i = 1; i < locs.length; i++) {
                    if (locs[i] === "") {
                        newHubLocs.push(NoLocation);
                    } else {
                        newHubLocs.push(placeIndex);
                        mapData.Locations[placeIndex++] = { Name: locs[i] };
                    }
                }

                mapData.Hubs[i] = { Name: locs[0], Locations: newHubLocs, ImageName: image ? "hgss/" + image : "" };

            }, "text");
        });
        mapData.Blockages = ["Trainer", "Flash", "Rock Smash", "Cut", "Bike", "Strength", "Surf", "Whirlpool", "Waterfall", "Rock Climb", "Event"];

        console.log(mapData);
    }, "text");
});