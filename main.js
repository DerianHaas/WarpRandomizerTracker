$(function () {
    var mainMap = new RegionMap();
    var currentHub = 0;
    var currentEntrance = NoLocation;
    var currentDestination = NoLocation;
    loadWorld().then(function () {
        mainMap.Link(1, 3);
        console.log(mainMap);
        $("#hubSelector").append(mainMap.DrawHubSelector());
        $(".hubButton").click(function () {
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
        return fetch("worlds/test.json").then(function (response) { return response.json(); }).then(function (data) {
            mainMap.Load(data);
        });
    }
    function displayCurrentHub() {
        $("#currentHub").empty().append(mainMap.DrawHub(currentHub));
        $(".entrance").click(function () {
            var locId = $(this).data("id");
            if (currentEntrance === NoLocation) {
                setEntrance(locId);
            }
            else if (currentEntrance === locId && currentDestination === NoLocation) {
                if (false) { // Check blockages
                    if (mainMap.MarkBlockage(locId, "")) {
                        setEntrance(NoLocation);
                    }
                }
                else {
                    if (mainMap.MarkDeadEnd(locId)) {
                        setEntrance(NoLocation);
                    }
                }
            }
            else if (currentDestination === locId) {
                if (mainMap.Link(currentEntrance, currentDestination)) {
                    setEntrance(NoLocation);
                    setDestination(NoLocation);
                }
            }
            else {
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
    function setEntrance(location) {
        currentEntrance = location;
        if (currentEntrance === NoLocation || currentEntrance >= mainMap.AllLocations.length) {
            $("#currentEntrance").text("");
        }
        else {
            $("#currentEntrance").text(mainMap.AllLocations[currentEntrance].Name);
        }
    }
    function setDestination(location) {
        currentDestination = location;
        if (currentDestination === NoLocation || currentDestination >= mainMap.AllLocations.length) {
            $("#currentDestination").text("");
        }
        else {
            $("#currentDestination").text(mainMap.AllLocations[currentDestination].Name);
        }
    }
});
//# sourceMappingURL=main.js.map