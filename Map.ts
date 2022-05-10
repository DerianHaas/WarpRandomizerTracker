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
            this.AllLocations.push({ Name: loc.Name, LinkedLocation: -1, BlockedBy: "" });
        }
        this.Hubs = data.Hubs;
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
