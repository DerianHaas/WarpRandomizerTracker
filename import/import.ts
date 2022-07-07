let parsedFiles: { [fileName: string]: { hubName: string, locNames: string[] } };
let files: string[];

let blockages = {
	"hgss": ["Trainer", "Flash", "Rock Smash", "Cut", "Bike", "Strength", "Surf", "Whirlpool", "Waterfall", "Rock Climb", "Power Plant", "Event"],
	"emerald": ["Trainer", "Cut", "Flash", "Bike", "Rock Smash", "Strength", "Surf", "Waterfall", "Dive", "Event"],
	"platinum": ["Trainer", "Rock Smash", "Cut", "Bike", "Surf", "Strength", "Rock Climb", "Waterfall", "Galactic Key", "Event"],
	"bw2": ["Trainer", "Cut", "Strength", "Surf", "Waterfall", "Dive", "Event"]
};

//const GAME_TO_IMPORT = "bw2";
function doImport(gameToImport: string)
{
	parsedFiles = {};
	files = [];

	$.get("import/" + gameToImport + "/hubs.txt", function (fileData)
	{
		files = fileData.split("\n");
		files = files.filter(file => file.trim() !== "");
		files.forEach((hubData) =>
		{
			let hubInfo: string[] = hubData.trim().split(",");
			let file = hubInfo[0];
			if (!file) return;
			$.get("import/" + gameToImport + "/" + file + ".txt", function (locData)
			{
				let locs: string[] = locData.trim().split("\n").map(loc => loc.trim());

				parsedFiles[file] = {
					hubName: locs[0],
					locNames: locs.slice(1)
				};
			}, "text");
		});
	}, "text");

	$(document).off("ajaxStop");
	$(document).ajaxStop(function ()
	{
		if (files.length > 0 && Object.keys(parsedFiles).length === files.length)
		{
			let mapData: LoadJSON = { Region: regionNames[gameToImport], Hubs: [], Locations: [], Blockages: [] };
			let placeIndex = 0;

			files.forEach((hubData) =>
			{
				let [file, image] = hubData.trim().split(",");
				let newHubLocs = [];
				parsedFiles[file].locNames.forEach((locData) =>
				{
					if (locData === "")
					{
						newHubLocs.push(NoLocation);
					} else
					{
						newHubLocs.push(placeIndex);
						let [locName, locBlock] = locData.split(",");
						let newLoc: LoadLocation = { Name: locName };
						if (locBlock)
						{
							newLoc.BlockedBy = locBlock.trim();
						}
						mapData.Locations[placeIndex++] = newLoc;
					}
				});

				mapData.Hubs.push({
					Name: parsedFiles[file].hubName,
					Locations: newHubLocs,
					ImageName: image ? gameToImport + "/" + image : ""
				});
			});

			mapData.Blockages = blockages[gameToImport];
			console.log(mapData);
		}
	});
}