$(function () {
    var mainMap = new RegionMap();
    var prevHub = 0;
    var currentHub = 0;
    var currentEntrance = NoLocation;
    var currentDestination = NoLocation;
    mainMap.Load("sinnoh").then(function () {
        //mainMap.Link(1, 3);
        $("#hubSelector").append(mainMap.DrawHubSelector());
        $(".hubButton").click(function () {
            setCurrentHub($(this).data("id"));
        });
        setCurrentHub(0);
        loadBlockages();
        displayGrid();
    });
    $("#clearButton").click(function () {
        setEntrance(NoLocation);
        setDestination(NoLocation);
    });
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
    function loadBlockages() {
        $("#blockageContainer").append($("<label>").addClass("blockageLabel").append([$("<input>").attr("type", "radio").attr("name", "blockage").attr("value", NoBlock).attr("id", "defaultBlockage"), $("<span>").text("None")]));
        for (var i = 0; i < blockTypes.length; i++) {
            var option = $("<label>").addClass("blockageLabel").css({
                "font-weight": "bold", "background-color": blockTypes[i].bkgcolor, "color": blockTypes[i].textcolor || "black"
            });
            option.append($("<input>").attr("type", "radio").attr("name", "blockage").attr("value", i));
            option.append($("<span>").text(blockTypes[i].name));
            $("#blockageContainer").append(option);
        }
        $(".blockageLabel").dblclick(function () {
            var blockage = getCurrentSelectedBlockage();
            if (currentEntrance !== NoLocation) {
                if (blockage != NoBlock && blockage != OneWayBlock) {
                    if (mainMap.MarkBlockage(currentEntrance, blockage)) {
                        setEntrance(NoLocation);
                        setDestination(NoLocation);
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
            if (currentEntrance === NoLocation) {
                // If no entrance is selected, set this one as the entrance
                setEntrance(locId);
            }
            else if (currentEntrance === locId && currentDestination === NoLocation) {
                // If this is already marked as the entrance and we have no destination, mark this as a dead end or blocked
                if (blockage != NoBlock && blockage != OneWayBlock) { // Check blockages
                    if (mainMap.MarkBlockage(locId, blockage)) {
                        setEntrance(NoLocation);
                    }
                    $("#defaultBlockage").prop("checked", true);
                }
                else {
                    if (mainMap.MarkDeadEnd(locId)) {
                        setEntrance(NoLocation);
                    }
                }
            }
            else if (currentDestination === locId) {
                // If this is already marked as the destination, perform the link
                if (mainMap.Link(currentEntrance, currentDestination, blockage === OneWayBlock)) {
                    setEntrance(NoLocation);
                    setDestination(NoLocation);
                    setCurrentHub(prevHub);
                    $("#defaultBlockage").prop("checked", true);
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