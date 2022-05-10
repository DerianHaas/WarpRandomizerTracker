$(() => {

    const mainMap: RegionMap = new RegionMap();
    let currentHub: number = 0;
    let currentEntrance: number = NoLocation;
    let currentDestination: number = NoLocation;

    loadWorld().then(() => {
        mainMap.Link(1, 3);
        console.log(mainMap);

        $("#hubSelector").append(mainMap.DrawHubSelector());
        $(".hubButton").click(function() {
            setCurrentHub($(this).data("id"));
            displayCurrentHub();
        });
        setCurrentHub(0);
    });


    $("#clearButton").click(function () {
        setEntrance(NoLocation);
        setDestination(NoLocation);
    });


    function loadWorld() {
        return fetch("worlds/test.json").then(response => response.json()).then(data => {
            mainMap.Load(data);
        });
    }

    function displayCurrentHub() {
        $("#currentHub").empty().append(mainMap.DrawHub(currentHub));
        $(".entrance").click(function () {
            let locId = $(this).data("id");
            if (currentEntrance === NoLocation) {
                setEntrance(locId);
            } else if (currentEntrance === locId && currentDestination === NoLocation) {
                if (false) { // Check blockages
                    if (mainMap.MarkBlockage(locId, "")) {
                        setEntrance(NoLocation);
                    }
                } else {
                    if (mainMap.MarkDeadEnd(locId)) {
                        setEntrance(NoLocation);
                    }
                }
            } else if (currentDestination === locId) {
                if (mainMap.Link(currentEntrance, currentDestination)) {
                    setEntrance(NoLocation);
                    setDestination(NoLocation);
                }
            } else {
                setDestination(locId);
            }
            displayCurrentHub();
        });
    }

    function setCurrentHub(hubId) {
        currentHub = hubId;
        displayCurrentHub();
        $("#currentHubImage").empty().append(mainMap.DrawHubImage(currentHub));
    }

    function setEntrance(location: number) {
        currentEntrance = location;
        if (currentEntrance === NoLocation || currentEntrance >= mainMap.AllLocations.length) {
            $("#currentEntrance").text("");
        } else {
            $("#currentEntrance").text(mainMap.AllLocations[currentEntrance].Name);
        }
    }

    function setDestination(location: number) {
        currentDestination = location;
        if (currentDestination === NoLocation || currentDestination >= mainMap.AllLocations.length) {
            $("#currentDestination").text("");
        } else {
            $("#currentDestination").text(mainMap.AllLocations[currentDestination].Name);
        }
    }


})