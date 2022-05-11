const NoLocation = -1;
const DeadEnd = -2;

const NoBlock = -1;
const OneWayBlock = 9;

const blockTypes: {name:string, bkgcolor: string, textcolor?: string }[] = [
    {
        name: "Trainer",
        bkgcolor: "orangered",
    },
    {
        name: "Rock Smash",
        bkgcolor: "brown",
        textcolor: "white"
    },
    {
        name: "Cut",
        bkgcolor: "darkgreen",
        textcolor: "white"
    },
    {
        name: "Bike",
        bkgcolor: "lightpink"
    },
    {
        name: "Strength",
        bkgcolor: "gold"
    },
    {
        name: "Surf",
        bkgcolor: "lightblue"
    },
    {
        name: "Rock Climb",
        bkgcolor: "mediumpurple"
    },
    {
        name: "Waterfall",
        bkgcolor: "darkblue",
        textcolor: "white"
    },
    {
        name: "Event",
        bkgcolor: "purple",
        textcolor: "white"
    },
    {
        name: "One Way",
        bkgcolor: "gray"
    }
]


type MapLocation = {

    Name: string;
    LinkedLocation: number;
    BlockedBy: number;

}

type Hub = {

    Name: string;
    Locations: number[];
    ImageName: string;
}

class RegionMap {

    Title: string;
    AllLocations: MapLocation[];
    Hubs: Hub[];

    ClearLink(locId) {
        let loc = this.AllLocations[locId];
        loc.BlockedBy = NoBlock;
        if (loc.LinkedLocation > NoLocation) {
            let linkedLoc = this.AllLocations[loc.LinkedLocation];
            linkedLoc.LinkedLocation = NoLocation;
            linkedLoc.BlockedBy = NoBlock;
        }
        loc.LinkedLocation = NoLocation;
    }

    Link(locId1: number, locId2: number, oneWay: boolean = false) {
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

        return true;
    }

    MarkBlockage(locId: number, block: number) {
        let loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as blocked?")) {
                return false;
            }
            this.ClearLink(loc.LinkedLocation);
        }
        loc.LinkedLocation = NoLocation;
        loc.BlockedBy = block;
        return true;
    }

    MarkDeadEnd(locId: number) {
        let loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as a dead end?")) {
                return false;
            }
            this.ClearLink(loc.LinkedLocation);
        }
        loc.LinkedLocation = DeadEnd;
        loc.BlockedBy = NoBlock;
        return true;
    }

    Load(data: MapJSON): void {
        this.AllLocations = [];
        this.Hubs = [];
        this.Title = data.Region;
        for (let loc of data.Locations) {
            this.AllLocations.push({ Name: loc.Name, LinkedLocation: NoLocation, BlockedBy: NoBlock });
        }
        this.Hubs = data.Hubs;
    }

    DrawHubSelector(): JQuery {
        let container = $("<div>");
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
            for (let locId of hub.Locations) {
                let loc = this.AllLocations[locId];
                let row = $("<tr>");
                row.append($("<td>").data("id", locId).text(loc.Name).addClass("entrance").attr("title", "ID: " + locId));
                row.append($("<td>").text(this.getLinkedLocationName(loc)).css(this.getLocationStyling(loc)).attr("title", "ID: " + this.AllLocations[locId].LinkedLocation));

                table.append(row);
            }
            box.append(table);
        }

        return box;
    }

    DrawHubImage(hubId: number): JQuery {
        let hub = this.Hubs[hubId];
        if (!hub.ImageName) {
            return null;
        }
        let imagePath = "images/" + hub.ImageName;
        return $("<img src=" + imagePath + ">").on("load", function () {
            $(this).width("20vw").height("20vw");
        });
    }

    DrawGrid(): JQuery {
        let container = $("<div>");
        for (let locId = 0; locId < this.AllLocations.length; locId++) {
            container.append($("<div>").data("id",locId).addClass("gridSquare").css(this.getLocationStyling(this.AllLocations[locId])));
        }
        return container;
    }
 
    ResetHub(hubId: number) {
        for (let locId of this.Hubs[hubId].Locations) {
            this.ClearLink(locId);
        }
    }

    ResetAll() {
        for (let locId = 0; locId < this.AllLocations.length; locId++) {
            this.ClearLink(locId);
        }
    }

    private getLinkedLocationName(loc: MapLocation): string {
        if (loc.LinkedLocation === NoLocation && loc.BlockedBy === NoBlock) {
            return " - ";
        }
        if (loc.LinkedLocation === DeadEnd) {
            return "Dead End";
        }
        if (loc.BlockedBy === OneWayBlock) {
            return "One Way (from " + this.AllLocations[loc.LinkedLocation].Name + ")"
        }
        if (loc.BlockedBy === NoBlock) {
            return this.AllLocations[loc.LinkedLocation].Name;
        }
        return blockTypes[loc.BlockedBy].name;
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
        //Handle blocks
        return { "font-weight": "bold", "background-color": blockTypes[loc.BlockedBy].bkgcolor, "color": blockTypes[loc.BlockedBy].textcolor || "black"};
    }

}




type MapJSON = {
    Region: string;
    Locations: {
        Name: string;
        Coords?: [number, number, number, number];
    }[];
    Hubs: Hub[];
}
