$(() => {

    fetch("import/input.json").then(response => response.json()).then(data => {
        let mapData = data as MapJSON;

        $.get("import/import.txt", function (data) {
            let locs: string[] = data.split("\n");
            locs = locs.map(loc => loc.trim());
            console.log(locs);

            let placeIndex = mapData.Locations.length;
            let newHubLocs = [];
            for (let i = 1; i < locs.length; i++) {
                if (locs[i] === "") {
                    newHubLocs.push(NoLocation);
                } else {
                    mapData.Locations.push({ Name: locs[i] });
                    newHubLocs.push(placeIndex++);
                }
            }

            mapData.Hubs.push({Name: locs[0], Locations: newHubLocs, ImageName: ""})

            console.log(mapData);

        }, "text");
    });
});