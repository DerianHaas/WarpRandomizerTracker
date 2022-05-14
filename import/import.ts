$(() => {

   
    let parsedFiles: { [fileName: string]: { hubName: string, locNames: string[] } } = {};
    let files: string[] = [];

    $.get("import/hgss/hubs.txt", function (fileData) {
        files = fileData.split("\n");
        files = files.filter(file => file.trim() !== "");
        files.forEach((hubData, i) => {
            let hubInfo: string[] = hubData.trim().split(",");
            let file = hubInfo[0];
            if (!file) return;
            $.get("import/hgss/" + file + ".txt", function (locData) {
                let locs: string[] = locData.trim().split("\n");
                locs = locs.map(loc => loc.trim());

                parsedFiles[file] = {
                    hubName: locs[0],
                    locNames: locs.slice(1)
                };
            }, "text");
        });      
    }, "text");

    $(document).ajaxStop(function () {
        if (files.length > 0 && Object.keys(parsedFiles).length === files.length) {
            let mapData: MapJSON = { Region: "johto", Hubs: [], Locations: [], Blockages: [] };
            let placeIndex = 0;

            files.forEach((hubData) => {
                let hubInfo: string[] = hubData.trim().split(",");
                let file = hubInfo[0];
                let image = hubInfo.length > 1 ? hubInfo[1] : "";
                let newHubLocs = [];
                parsedFiles[file].locNames.forEach((loc, i) => {
                    if (loc === "") {
                        newHubLocs.push(NoLocation);
                    } else {
                        newHubLocs.push(placeIndex);
                        mapData.Locations[placeIndex++] = { Name: loc };
                    }
                });
                mapData.Hubs.push({ Name: parsedFiles[file].hubName, Locations: newHubLocs, ImageName: image ? "hgss/" + image : "" });
            });


            mapData.Blockages = ["Trainer", "Flash", "Rock Smash", "Cut", "Bike", "Strength", "Surf", "Whirlpool", "Waterfall", "Rock Climb", "Power Plant", "Event"];
            console.log(mapData);
        }   
    });
});