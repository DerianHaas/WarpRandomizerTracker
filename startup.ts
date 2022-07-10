$(() => {


    $("#openStartup").click(function () { $("#startupModal").show(); });

    $("#openStartup").click();

    $(".close").click(function () { $("#startupModal").hide(); });

    window.onclick = function (event) {
        if (event.target.id == "startupModal") {
            $("#startupModal").hide();
        }
    }

    $("select[name=loadOption]").change(function () {
        let selected = $(this).find("option:selected").val();
        let worldName = $("input[type=radio][name=worldOption]:checked").val();
        updateWorldSelection(selected !== "loadExisting");

        if (worldName === "bw2" && selected === "loadNew") {
            $("#unovaSettings").show();
        } else {
            $("#unovaSettings").hide();
        }
    });

    $("input[type=radio][name=worldOption]").change(function () {
        let worldName = $(this).val();
        let loadOption = $("select[name=loadOption] option:selected").val();
        if (worldName === "bw2" && loadOption === "loadNew") {
            $("#unovaSettings").show();
        } else {
            $("#unovaSettings").hide();
        }
        $("#loadWorld").prop("disabled", false);
    });

    $("select[name=loadOption] option[value=loadExisting]").prop("selected", true).change();

    function updateWorldSelection(enableAll: boolean) {
        $("input[type=radio][name=worldOption]").each(function () {
            let worldName = regionNames[$(this).val().toString()];
            if (!enableAll) {
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
        let version = "";
        if (!loadSaved) {
            version = $("input[name=bw2creator]:checked").val().toString();
        }
        mainMap = new RegionMap();
        mainMap.Load("unova", loadSaved, version).then(initialSetup).then(() => {
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