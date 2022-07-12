$(() => {


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
    }

    $("select[name=loadOption]").change(function () {
        updateWorldSelection();
    });

    $("input[type=radio][name=worldOption]").change(function () {
        updateWorldSelection();
       
        $("#loadWorld").prop("disabled", false);
    });

    $("select[name=loadOption] option[value=loadExisting]").prop("selected", true).change();

    function updateWorldSelection() {
        let loadOption = $("select[name=loadOption] option:selected").val();
        let selectedWorldName = $("input[type=radio][name=worldOption]:checked").val();

        $("input[type=radio][name=worldOption]").each(function () {
            let worldName = regionNames[$(this).val().toString()];
            if (loadOption === "loadExisting") {
                let localData = localStorage.getItem("warpMap-" + worldName);
                if (localData === null && $(this).prop("checked")) {
                    $(this).prop("checked", false);
                    $("#loadWorld").prop("disabled", true);
                }
                $(this).prop("disabled", localData === null);
            } else {
                $(this).prop("disabled", false);
            } 
        });

        if (selectedWorldName === "bw2" && loadOption === "loadNew") {
            $("#unovaSettings").show();
        } else {
            $("#unovaSettings").hide();
        }
    }

    $("#loadWorld").click(function () {
        $("#startupModal").hide();
        let worldName = $("input[name=worldOption]:checked").val();
        let loadOption = $("select[name=loadOption] option:selected").val();
        if (loadOption === "import") {
            doImport(worldName.toString());
        } else {
            let loadSaved = loadOption === "loadExisting";
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

    function loadHoenn(loadSaved: boolean) {
        mainMap = new RegionMap();
        mainMap.Load("hoenn", loadSaved).then(initialSetup);
    }

    function loadSinnoh(loadSaved: boolean) {
        mainMap = new RegionMap();
        mainMap.Load("sinnoh", loadSaved).then(initialSetup);
    }

    function loadJohto(loadSaved: boolean) {
        mainMap = new RegionMap();
        mainMap.Load("johto", loadSaved).then(initialSetup).then(() => {
            if (!loadSaved) {
                addInitialLink("Cherrygrove Pokecenter", "Cherrygrove PC Entrance");
                redraw();
            }
        });
    }

    function loadUnova(loadSaved: boolean) {
        let version = "", season = "";
        if (!loadSaved) {
            version = $("input[name=bw2creator]:checked").val().toString();
            season = $("input[name=season]:checked").val().toString();
        }
        mainMap = new RegionMap();
        mainMap.Load("unova", loadSaved, version, season).then(initialSetup).then(() => {
            if (version === "adrienn") {
                addInitialLink("Aspertia Pokecenter", "Aspertia Pokecenter Interior");
                addInitialLink("Nimbasa Gear Station", "Gear Station Stairs");
            }
            redraw();
        });
    }

    function addInitialLink(loc1: string, loc2: string) {
        let locId1 = mainMap.AllLocations.findIndex(loc => loc?.Name === loc1);
        let locId2 = mainMap.AllLocations.findIndex(loc => loc?.Name === loc2);
        if (locId1 !== NoLocation && locId2 != NoLocation) {
            mainMap.Link(locId1, locId2, false, "", true);
        }
    }

    function loadBlockages() {
        $("#blockages").empty().append(mainMap.DrawBlockages());

        $(".blockageLabel").dblclick(function () {
            let blockage = getCurrentSelectedBlockage();
            if (currentEntrance !== NoLocation) {
                if (blockage != NoBlock && blockage != OneWayBlock) {
                    let linkNotes = $("#linkCustomNote").val().toString();
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