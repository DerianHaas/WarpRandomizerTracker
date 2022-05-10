const NoLocation = -1;
const DeadEnd = -2;

type MapLocation = {

    Name: string;
    LinkedLocation: number;
    BlockedBy: string;

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

    Link(locId1: number, locId2: number, oneWay: boolean = false) {
        let loc1 = this.AllLocations[locId1];
        let loc2 = this.AllLocations[locId2];
        if ((loc1.LinkedLocation > NoLocation && loc1.LinkedLocation !== locId2) || (loc2.LinkedLocation > NoLocation && loc2.LinkedLocation !== locId1)) {
            if (!confirm("One of these locations is already linked to a different location.  Are you sure you want to overwrite it?")) {
                return false;
            }
        }
        loc1.LinkedLocation = locId2;
        if (!oneWay) loc2.LinkedLocation = locId1;
        return true;
    }

    MarkBlockage(locId: number, blocks: string) {
        let loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as blocked?")) {
                return false;
            }
            this.AllLocations[loc.LinkedLocation].LinkedLocation = NoLocation;
        }
        loc.LinkedLocation = NoLocation;
        loc.BlockedBy = blocks;
        return true;
    }

    MarkDeadEnd(locId: number) {
        let loc = this.AllLocations[locId];
        if (loc.LinkedLocation > NoLocation) {
            if (!confirm("This location already links to " + this.getLinkedLocationName(loc) + ".  Are you sure you want to mark it as a dead end?")) {
                return false;
            }
            this.AllLocations[loc.LinkedLocation].LinkedLocation = NoLocation;
        }
        loc.LinkedLocation = DeadEnd;
        loc.BlockedBy = "";
        return true;
    }

    Load(data: MapJSON): void {
        this.AllLocations = [];
        this.Hubs = [];
        this.Title = data.Region;
        for (let loc of data.Locations) {
            this.AllLocations.push({ Name: loc.Name, LinkedLocation: NoLocation, BlockedBy: "" });
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
                row.append($("<td>").data("id",locId).text(loc.Name).addClass("entrance").attr("title","ID: " + locId));
                row.append($("<td>").text(this.getLinkedLocationName(loc)).addClass(this.getLocationStyling(loc)).attr("title", "ID: " + this.AllLocations[locId].LinkedLocation));

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
            $(this).width("50vh").height("50vh");
        });
    }

    private getLinkedLocationName(loc: MapLocation): string {
        if (loc.LinkedLocation === NoLocation) {
            return " - ";
        }
        if (loc.LinkedLocation === DeadEnd) {
            return "Dead End";
        }
        return this.AllLocations[loc.LinkedLocation].Name;
    }

    private getLocationStyling(loc: MapLocation): string {
        if (loc.LinkedLocation === NoLocation) {
            return "";
        } else if (loc.LinkedLocation === DeadEnd) {
            return "deadEnd"
        }
        if (!loc.BlockedBy) {
            return "connected";
        }
        //Handle blocks
        return "";
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
