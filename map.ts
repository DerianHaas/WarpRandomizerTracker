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

    Link(loc1: number, loc2: number, oneWay: boolean = false) {
        this.AllLocations[loc1].LinkedLocation = loc2;
        if (!oneWay) this.AllLocations[loc2].LinkedLocation = loc1;
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
            $("<div>").data("id", i).text(this.Hubs[i].Name).addClass("hubButton").appendTo(container);
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
                row.append($("<td>").text(loc.Name).addClass("connected"));
                row.append($("<td>").text(this.getLinkedLocationName(loc)).addClass(this.getLocationStyling(loc)));

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
