$(function () {
    var mainMap = new RegionMap();
    var prevHub = 0;
    var currentHub = 0;
    var currentEntrance = NoLocation;
    var currentDestination = NoLocation;
    $("#hoennSelect").click(function () {
        mainMap.Load("hoenn").then(initialSetup);
    });
    $("#sinnohSelect").click(function () {
        mainMap.Load("sinnoh").then(initialSetup);
    });
    $("#johtoSelect").click(function () {
        mainMap.Load("johto").then(initialSetup);
    });
    $("#clearButton").click(clearSelections);
    $("#resetHub").click(function () {
        if (confirm("Reset all warps in " + mainMap.Hubs[currentHub].Name + "?")) {
            mainMap.ResetHub(currentHub);
            redraw();
        }
    });
    $("#resetAll").click(function () {
        if (confirm("Are you sure you want to reset all warps?")) {
            mainMap.ResetAll();
            redraw();
        }
    });
    function initialSetup() {
        $("#hubSelector").empty().append(mainMap.DrawHubSelector());
        $(".hubButton").click(function () {
            setCurrentHub($(this).data("id"));
        });
        setCurrentHub(0);
        loadBlockages();
        displayGrid();
        $("#customNotes").val(mainMap.CustomNotes);
    }
    function loadBlockages() {
        $("#blockages").empty().append(mainMap.DrawBlockages());
        $(".blockageLabel").dblclick(function () {
            var blockage = getCurrentSelectedBlockage();
            if (currentEntrance !== NoLocation) {
                if (blockage != NoBlock && blockage != OneWayBlock) {
                    var linkNotes = $("#linkCustomNote").val().toString();
                    if (mainMap.MarkBlockage(currentEntrance, blockage, linkNotes)) {
                        clearSelections();
                        redraw();
                    }
                    $("#defaultBlockage").prop("checked", true);
                }
            }
        });
    }
    function displayCurrentHub() {
        $("#currentHub").empty().append(mainMap.DrawHub(currentHub));
        $(".entrance").click(function () {
            var locId = $(this).data("id");
            var blockage = getCurrentSelectedBlockage();
            var linkNotes = $("#linkCustomNote").val().toString();
            if (currentEntrance === NoLocation) {
                // If no entrance is selected, set this one as the entrance
                setEntrance(locId);
            }
            else if (currentEntrance === locId && currentDestination === NoLocation) {
                // If this is already marked as the entrance and we have no destination, mark this as a dead end or blocked
                if (blockage != NoBlock && blockage != OneWayBlock) { // Check blockages
                    if (mainMap.MarkBlockage(locId, blockage, linkNotes)) {
                        clearSelections();
                    }
                }
                else {
                    if (mainMap.MarkDeadEnd(locId, linkNotes)) {
                        clearSelections();
                    }
                }
            }
            else if (currentDestination === locId) {
                // If this is already marked as the destination, perform the link
                if (mainMap.Link(currentEntrance, currentDestination, blockage === OneWayBlock, linkNotes)) {
                    setCurrentHub(prevHub);
                    clearSelections();
                }
            }
            else if (currentEntrance === locId) {
                // If the entrance is reselected after selecting a destination, clear the destination
                setDestination(NoLocation);
            }
            else {
                // Overwrite the current destination with this location
                setDestination(locId);
            }
            redraw();
        });
    }
    function clearSelections() {
        setEntrance(NoLocation);
        setDestination(NoLocation);
        $("#defaultBlockage").prop("checked", true);
        $("#linkCustomNote").val("");
    }
    function displayGrid() {
        $("#gridContainer").empty().append(mainMap.DrawGrid());
        $(".gridSquare").dblclick(function () {
            var locId = $(this).data("id");
            setCurrentHub(mainMap.Hubs.findIndex(function (hub) { return hub.Locations.includes(locId); }));
        });
    }
    function redraw() {
        displayCurrentHub();
        displayGrid();
    }
    function setCurrentHub(hubId) {
        currentHub = hubId;
        displayCurrentHub();
        $("#currentHubImage").empty().append(mainMap.DrawHubImage(currentHub));
    }
    function setEntrance(location) {
        if (location !== NoLocation) {
            prevHub = currentHub;
        }
        currentEntrance = location;
        if (currentEntrance === NoLocation || currentEntrance >= mainMap.AllLocations.length) {
            $("#currentEntrance").text("");
            $("#linkCustomNote").val("");
        }
        else {
            $("#currentEntrance").text(mainMap.AllLocations[currentEntrance].Name);
            if (mainMap.AllLocations[location].Notes) {
                $("#linkCustomNote").val(mainMap.AllLocations[location].Notes);
            }
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
    function getCurrentSelectedBlockage() {
        var blockage = $("input[name='blockage']:checked").val();
        if (blockage === undefined) {
            return NoBlock;
        }
        if (typeof blockage === "string") {
            blockage = parseInt(blockage);
        }
        else {
            blockage = blockage;
        }
        return blockage;
    }
});
//# sourceMappingURL=main.js.map