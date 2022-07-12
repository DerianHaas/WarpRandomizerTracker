$(function () {
    $("#openStartup").click(function () { $("#startupModal").show(); });
    $("#openInfo").click(function () { $("#infoModal").show(); });
    $("#openStartup").click();
    $(".close").click(function () { $("#startupModal").hide(); $("#infoModal").hide(); });
    window.onclick = function (event) {
        if (event.target.id == "startupModal") {
            $("#startupModal").hide();
        }
        if (event.target.id === "infoModal") {
            $("#infoModal").hide();
        }
    };
    $("select[name=loadOption]").change(function () {
        updateWorldSelection();
    });
    $("input[type=radio][name=worldOption]").change(function () {
        updateWorldSelection();
        $("#loadWorld").prop("disabled", false);
    });
    $("select[name=loadOption] option[value=loadExisting]").prop("selected", true).change();
    function updateWorldSelection() {
        var loadOption = $("select[name=loadOption] option:selected").val();
        var selectedWorldName = $("input[type=radio][name=worldOption]:checked").val();
        $("input[type=radio][name=worldOption]").each(function () {
            var worldName = regionNames[$(this).val().toString()];
            if (loadOption === "loadExisting") {
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
        if (selectedWorldName === "bw2" && loadOption === "loadNew") {
            $("#unovaSettings").show();
        }
        else {
            $("#unovaSettings").hide();
        }
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
        mainMap.Load("sinnoh", loadSaved).then(initialSetup);
    }
    function loadJohto(loadSaved) {
        mainMap = new RegionMap();
        mainMap.Load("johto", loadSaved).then(initialSetup).then(function () {
            if (!loadSaved) {
                addInitialLink("Cherrygrove Pokecenter", "Cherrygrove PC Entrance");
                redraw();
            }
        });
    }
    function loadUnova(loadSaved) {
        var version = "", season = "";
        if (!loadSaved) {
            version = $("input[name=bw2creator]:checked").val().toString();
            season = $("input[name=season]:checked").val().toString();
        }
        mainMap = new RegionMap();
        mainMap.Load("unova", loadSaved, version, season).then(initialSetup).then(function () {
            if (version === "adrienn") {
                addInitialLink("Aspertia Pokecenter", "Aspertia Pokecenter Interior");
                addInitialLink("Nimbasa Gear Station", "Gear Station Stairs");
            }
            redraw();
        });
    }
    function addInitialLink(loc1, loc2) {
        var locId1 = mainMap.AllLocations.findIndex(function (loc) { return (loc === null || loc === void 0 ? void 0 : loc.Name) === loc1; });
        var locId2 = mainMap.AllLocations.findIndex(function (loc) { return (loc === null || loc === void 0 ? void 0 : loc.Name) === loc2; });
        if (locId1 !== NoLocation && locId2 != NoLocation) {
            mainMap.Link(locId1, locId2, false, "", true);
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