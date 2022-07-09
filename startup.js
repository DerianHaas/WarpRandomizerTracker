$(function () {
    $("#openStartup").click(function () { $("#startupModal").show(); });
    $("#openStartup").click();
    $(".close").click(function () { $("#startupModal").hide(); });
    window.onclick = function (event) {
        if (event.target.id == "startupModal") {
            $("#startupModal").hide();
        }
    };
    $("select[name=loadOption]").change(function () {
        var selected = $(this).find("option:selected");
        updateWorldSelection(selected.val() !== "loadExisting");
    });
    $("input[type=radio][name=worldOption]").change(function () {
        var worldName = $(this).val();
        if (worldName === "bw2") {
            $("#unovaSettings").show();
        }
        else {
            $("#unovaSettings").hide();
        }
        $("#loadWorld").prop("disabled", false);
    });
    $("select[name=loadOption] option[value=loadExisting]").prop("selected", true).change();
    function updateWorldSelection(enableAll) {
        $("input[type=radio][name=worldOption]").each(function () {
            var worldName = regionNames[$(this).val().toString()];
            if (!enableAll) {
                var localData = localStorage.getItem("warpMap-" + worldName);
                if (localData === null && $(this).prop("checked")) {
                    $(this).prop("checked", false);
                    $("#loadWorld").prop("disabled", true);
                }
                $(this).prop("disabled", localData === null);
            }
            else {
                $(this).prop("disabled", false);
            }
        });
    }
    $("#loadWorld").click(function () {
        $("#startupModal").hide();
        var worldName = $("input[name=worldOption]:checked").val();
        var loadOption = $("select[name=loadOption] option:selected").val();
        if (loadOption === "import") {
            doImport(worldName.toString());
        }
        else {
            var loadSaved = loadOption === "loadExisting";
            switch (worldName) {
                case "emerald":
                    loadHoenn(loadSaved);
                    break;
                case "platinum":
                    loadSinnoh(loadSaved);
                    break;
                case "hgss":
                    loadJohto(loadSaved);
                    break;
                case "bw2":
                    loadUnova(loadSaved);
                    break;
            }
        }
    });
    function initialSetup() {
        $("#content").css("display", "flex");
        $("#content").show();
        $("#hubSelector").empty().append(mainMap.DrawHubSelector());
        resizeHubSelector();
        $(".hubButton").click(function () {
            setCurrentHub($(this).data("id"));
        });
        setCurrentHub(0);
        loadBlockages();
        redraw();
        $("#customNotes").val(mainMap.CustomNotes);
    }
    function loadHoenn(loadSaved) {
        mainMap = new RegionMap();
        mainMap.Load("hoenn", loadSaved).then(initialSetup);
    }
    function loadSinnoh(loadSaved) {
        mainMap = new RegionMap();
        mainMap.Load("sinnoh", loadSaved).then(function () {
            addHMHub("sinnoh");
        }).then(initialSetup);
    }
    function loadJohto(loadSaved) {
        mainMap = new RegionMap();
        mainMap.Load("johto", loadSaved).then(initialSetup).then(function () {
            if (!loadSaved) {
                var cherryPC1 = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "Cherrygrove Pokecenter"; });
                var cherryPC2 = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "Cherrygrove PC Entrance"; });
                if (cherryPC1 !== NoLocation && cherryPC2 != NoLocation) {
                    mainMap.Link(cherryPC1, cherryPC2, false, "", true);
                }
                redraw();
            }
        });
    }
    function loadUnova(loadSaved) {
        mainMap = new RegionMap();
        mainMap.Load("unova", loadSaved).then(initialSetup);
    }
    function addHMHub(region) {
        if (!$("#forceFileLoad").prop("checked"))
            return;
        if (region === "sinnoh") {
            var hmLocs = [];
            var rockSmashLoc = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "Oreburgh Gate West Exit"; });
            if (rockSmashLoc !== NoLocation) {
                hmLocs.push(rockSmashLoc);
                hmLocs.push(NoLocation);
            }
            var surfLoc = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "Celestic Ruins Interior (Cyrus)"; });
            if (surfLoc !== NoLocation) {
                hmLocs.push(surfLoc);
                hmLocs.push(NoLocation);
            }
            var strengthLoc = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "Iron Island Exterior Entrance"; });
            if (strengthLoc !== NoLocation) {
                hmLocs.push(strengthLoc);
                hmLocs.push(NoLocation);
            }
            var rockClimbLoc = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "R217 House W"; });
            if (rockClimbLoc !== NoLocation) {
                hmLocs.push(rockClimbLoc);
                hmLocs.push(NoLocation);
            }
            var keyLoc = mainMap.AllLocations.findIndex(function (loc) { return loc.Name === "Galactic Warehouse B2F Stairs C"; });
            if (keyLoc !== NoLocation) {
                hmLocs.push(keyLoc);
            }
            mainMap.Hubs.push({ Locations: hmLocs, Name: "HM Locations", ImageName: "" });
        }
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
});
//# sourceMappingURL=startup.js.map