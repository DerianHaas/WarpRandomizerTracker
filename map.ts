const NoLocation = -1;
const DeadEnd = -2;

const NoBlock = -1;
let OneWayBlock: number = -1;

const blockageColors: { [blockage: string]: { bkg?: string, text?: string } } = {
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
    },
    "Galactic Key": {
        bkg: "red",
        text: "white"
    }
};

const regionNames = {
    "hgss": "johto",
    "emerald": "hoenn",
    "platinum": "sinnoh",
    "bw2": "unova"
};



type MapLocation = {

    Name: string;
    LinkedLocation: number;
    BlockedBy: number;
    Notes?: string;
}

type Hub = {

    Name: string;
    Locations: number[];
    ImageName?: string;
    Version?: string;
}

class RegionMap {

    Title: string;
    AllLocations: MapLocation[];
    Hubs: Hub[];
    CustomNotes: string;

    RegionBlockageTypes: string[];

    ClearLink(locId: number) {
        let loc = this.AllLocations[locId];
        loc.BlockedBy = NoBlock;
        if (loc.LinkedLocation > NoLocation) {
            let linkedLoc = this.AllLocations[loc.LinkedLocation];
            linkedLoc.LinkedLocation = NoLocation;
            linkedLoc.BlockedBy = NoBlock;
        }
        loc.LinkedLocation = NoLocation;
    }

    Link(locId1: number, locId2: number, oneWay: boolean, notes?: string, dontSave?: boolean) {
        let loc1 = this.AllLocations[locId1];
        let loc2 = this.AllLocations[locId2];
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

        if (!dontSave) { this.saveToLocalStorage(); }

        return true;
    }

    MarkBlockage(locId: number, block: number, notes?: string) {
        let loc = this.AllLocations[locId];
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
    }

    MarkDeadEnd(locId: number, notes?: string) {
        let loc = this.AllLocations[locId];
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
    }

    DrawHubSelector(): JQuery {
        let container = $("<div>").attr("id", "hubSelectContainer");
        for (let i = 0; i < this.Hubs.length; i++) {
            $("<div>").data("id", i).text(this.Hubs[i].Name).addClass("hubButton").attr("title", "ID: " + i).appendTo(container);
        }
        return container;
    }

    DrawHub(hubId: number): JQuery {
        let hub = this.Hubs[hubId];
        let box = $("<div>");

        let header = $("<h1 style='text-align:center'>").text(hub.Name);
        box.append(header);

        if (hub.Locations.length > 0) {
            let table = $("<table>").addClass("tableBorder");
            let rowSkipped = true;
            for (let locId of hub.Locations) {
                let row = $("<tr>");
                if (locId !== NoLocation) {
                    let loc = this.AllLocations[locId];
                    if (!loc) continue;
                    let entranceItem = $("<td>").data("id", locId).text(loc.Name).addClass("entrance").attr("title", "ID: " + locId);
                    let destinationItem = $("<td>").text(this.getLinkedLocationName(loc)).css(this.getLocationStyling(loc))
                    if (loc.LinkedLocation > NoLocation) {
                        destinationItem.data("id", loc.LinkedLocation).addClass("destination").attr("title", "ID: " + this.AllLocations[locId].LinkedLocation);;
                    }

                    row.append([entranceItem, destinationItem]);
                    table.append(row);
                    rowSkipped = false;
                } else {
                    if (!rowSkipped) {
                        row = row.addClass("emptyRow");
                        table.append(row);
                        rowSkipped = true;
                    }
                }
            }
            box.append(table);
        }

        return box;
    }

    DrawBlockages(): JQuery {
        let container = $("<div>");
        container.append($("<label>").addClass("blockageLabel").append([$("<input>").attr("type", "radio").attr("name", "blockage").attr("value", NoBlock).attr("id", "defaultBlockage"), $("<span>").text("None")]));
        this.RegionBlockageTypes.forEach((blockName, i) => {
            let option = $("<label>").addClass("blockageLabel").css({
                "font-weight": "bold", "background-color": blockageColors[blockName].bkg || "white", "color": blockageColors[blockName].text || "black"
            });

            option.append($("<input>").attr("type", "radio").attr("name", "blockage").attr("value", i));
            option.append($("<span>").text(blockName));

            container.append(option);
        });
        return container;
    }

    DrawHubImage(hubId: number): JQuery {
        let hub = this.Hubs[hubId];
        if (!hub.ImageName) {
            return null;
        }
        let imagePath = "images/" + hub.ImageName;
        return $("<img src=" + imagePath + ">").on("load", function () {
            $(this).css({ "maxWidth": "25vw", "maxHeight": "60vh", "background-size": "cover" });
        });
    }

    DrawGrid(): JQuery {
        let container = $("<div>").attr("id", "gridWrapper");
        for (let locId = 0; locId < this.AllLocations.length; locId++) {
            if (this.AllLocations[locId]) {
                container.append($("<div>").data("id", locId).addClass("gridSquare").css(this.getLocationStyling(this.AllLocations[locId])));
            }
        }
        return container;
    }
 
    ResetHub(hubId: number) {
        for (let locId of this.Hubs[hubId].Locations) {
            if (locId !== NoLocation) this.ClearLink(locId);
        }
        this.saveToLocalStorage();
    }

    ResetAll() {
        for (let locId = 0; locId < this.AllLocations.length; locId++) {
            if (this.AllLocations[locId]) {
                this.ClearLink(locId);
            }
        }
        this.saveToLocalStorage();
    }

    FindHub(locId: number) {
       return this.Hubs.findIndex(hub => hub.Locations.includes(locId));
    }

    Load(region: string, loadSavedRun: boolean, version?: string): Promise<void> {
        if (loadSavedRun && this.loadFromLocalStorage(region)) {
            return Promise.resolve();
        }

        return fetch("worlds/" + region + ".json").then<LoadJSON>(response => response.json()).then((data) => {
            this.AllLocations = [];
            this.Hubs = [];
            this.Title = data.Region;
            let skippedHubLocs = [];
            data.Hubs.forEach(hub => {
                if (!version || !hub.Version || version === hub.Version) {
                    this.Hubs.push(hub);
                } else {
                    skippedHubLocs = skippedHubLocs.concat(hub.Locations);
                }
            });
            this.RegionBlockageTypes = data.Blockages;
            if (!this.RegionBlockageTypes.includes("One Way")) {
                OneWayBlock = this.RegionBlockageTypes.length;
                this.RegionBlockageTypes.push("One Way");
            }
            if (!this.RegionBlockageTypes.includes("Other")) {
                this.RegionBlockageTypes.push("Other");
            }

            for (let locIndex = 0; locIndex < data.Locations.length; locIndex++) {
                let loc = data.Locations[locIndex];
                if (skippedHubLocs.includes(locIndex)) { this.AllLocations.push(undefined); }
                else if (version && loc.Version && loc.Version !== version) { this.AllLocations.push(undefined); }
                else {
                    let defaultBlock = NoBlock;
                    if (loc.BlockedBy) {
                        defaultBlock = this.RegionBlockageTypes.indexOf(loc.BlockedBy);
                    }
                    this.AllLocations.push({ Name: loc.Name, LinkedLocation: NoLocation, BlockedBy: defaultBlock });
                }
            }
        });
    }

    private getLinkedLocationName(loc: MapLocation): string {
        let linkName = "";
        if (loc.LinkedLocation === NoLocation && loc.BlockedBy === NoBlock) {
            return " - ";
        } else if (loc.LinkedLocation === DeadEnd) {
            linkName = "Dead End";
        } else if (loc.BlockedBy === OneWayBlock) {
            linkName = "One Way from " + this.AllLocations[loc.LinkedLocation].Name;
        } else if (loc.BlockedBy === NoBlock) {
            linkName = this.AllLocations[loc.LinkedLocation].Name;
        } else {
            linkName = this.RegionBlockageTypes[loc.BlockedBy];
        }
        if (loc.Notes) {
            linkName += " (" + loc.Notes + ")";
        }
        return linkName;
    }

    private getLocationStyling(loc: MapLocation): {[style:string]: string} {
        if (loc.LinkedLocation === NoLocation && loc.BlockedBy === NoBlock) {
            return { "font-weight": "bold"};
        } else if (loc.LinkedLocation === DeadEnd) {
            return { "font-weight": "bold", "background-color": "gray" };
        }
        if (loc.BlockedBy === NoBlock) {
            return { "font-weight": "bold", "background-color": "lightgreen" };
        }
        let blockageName = this.RegionBlockageTypes[loc.BlockedBy];
        return { "font-weight": "bold", "background-color": blockageColors[blockageName].bkg || "white", "color": blockageColors[blockageName].text || "black"};
    }

    private saveToLocalStorage() {
        this.CustomNotes = $("#customNotes").val().toString();  
        let mapJSON: LocalStorageJSON = { Region: this.Title, Hubs: this.Hubs, Locations: this.AllLocations, Blockages: this.RegionBlockageTypes, CustomNotes: this.CustomNotes };
        localStorage.setItem("warpMap-"+this.Title, JSON.stringify(mapJSON));
    }

    private loadFromLocalStorage(region:string): boolean {
        let localData = localStorage.getItem("warpMap-"+region);
        if (!localData) return false;
        let mapJSON: LocalStorageJSON = JSON.parse(localData);
        this.Title = mapJSON.Region;
        this.AllLocations = mapJSON.Locations;
        this.Hubs = mapJSON.Hubs;
        this.RegionBlockageTypes = mapJSON.Blockages;
        OneWayBlock = this.RegionBlockageTypes.indexOf("One Way");
        this.CustomNotes = mapJSON.CustomNotes;
        return true;
    }

}

type LocalStorageJSON = {
    Region: string;
    Hubs: Hub[];
    Locations: MapLocation[];
    Blockages: string[];
    CustomNotes: string;
}

type LoadLocation = {
    Name: string;
    BlockedBy?: string;
    Version?: string;
}

type LoadJSON = {
    Region: string;
    Locations: LoadLocation[];
    Hubs: Hub[];
    Blockages: string[];
}
