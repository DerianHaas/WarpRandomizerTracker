$(() =>
{
    

    $("#openStartup").click(function() { $("#startupModal").show(); });

    $("#openStartup").click();

    $(".close").click(function() { $("#startupModal").hide(); });

    window.onclick = function (event)
    {
        if (event.target.id == "startupModal")
        {
            $("#startupModal").hide();
        }
    }

    $("select[name=loadOption]").change(function ()
    {
        let selected = $(this).find("option:selected");
        updateWorldSelection(selected.val() !== "loadExisting");
    });

    $("input[type=radio][name=worldOption]").change(function ()
    {
        let worldName = $(this).val();
        if (worldName === "bw2")
        {
            $("#unovaSettings").show();
		} else
        {
            $("#unovaSettings").hide();
        }
        $("#loadWorld").prop("disabled", false);
    });

    $("select[name=loadOption] option[value=loadExisting]").prop("selected", true).change();

	function updateWorldSelection(enableAll: boolean)
    {
        $("input[type=radio][name=worldOption]").each(function ()
        {
            let worldName = regionNames[$(this).val().toString()];
            if (!enableAll)
            {
                let localData = localStorage.getItem("warpMap-" + worldName);
				if (localData === null && $(this).prop("checked"))
                {
                    $(this).prop("checked", false);
                    $("#loadWorld").prop("disabled", true);
				}
                $(this).prop("disabled", localData === null);
			} else
            {
                $(this).prop("disabled", false);
			}
        });
    }

    $("#loadWorld").click(function ()
    {
        $("#startupModal").hide();
        let worldName = $("input[name=worldOption]:checked").val();
        let loadOption = $("select[name=loadOption] option:selected").val();
        if (loadOption === "import")
        {
            doImport(worldName.toString());
        } else
        {
            let loadSaved = loadOption === "loadExisting";
            switch (worldName)
            {
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
   

    function initialSetup()
    {
        $("#content").css("display", "flex");
        $("#content").show();

        $("#hubSelector").empty().append(mainMap.DrawHubSelector());
        resizeHubSelector();

        $(".hubButton").click(function ()
        {
            setCurrentHub($(this).data("id"));
        });
        setCurrentHub(0);

        loadBlockages();
        redraw();
        $("#customNotes").val(mainMap.CustomNotes);
    }

    function loadHoenn(loadSaved: boolean)
    {
        mainMap = new RegionMap();
        mainMap.Load("hoenn", loadSaved).then(initialSetup);
	}

    function loadSinnoh(loadSaved: boolean)
    {
        mainMap = new RegionMap();
        mainMap.Load("sinnoh", loadSaved).then(initialSetup);
    }

    function loadJohto(loadSaved: boolean)
    {
        mainMap = new RegionMap();
        mainMap.Load("johto", loadSaved).then(initialSetup).then(() =>
        {
            if (!loadSaved)
            {
                let cherryPC1 = mainMap.AllLocations.findIndex(loc => loc.Name === "Cherrygrove Pokecenter");
                let cherryPC2 = mainMap.AllLocations.findIndex(loc => loc.Name === "Cherrygrove PC Entrance");
                if (cherryPC1 !== NoLocation && cherryPC2 != NoLocation)
                {
                    mainMap.Link(cherryPC1, cherryPC2, false, "", true);
                }
                redraw();
            }
        });
    }

    function loadUnova(loadSaved: boolean)
    {
        mainMap = new RegionMap();
        mainMap.Load("unova", loadSaved).then(initialSetup);
	}

    function loadBlockages()
    {
        $("#blockages").empty().append(mainMap.DrawBlockages());

        $(".blockageLabel").dblclick(function ()
        {
            let blockage = getCurrentSelectedBlockage();
            if (currentEntrance !== NoLocation)
            {
                if (blockage != NoBlock && blockage != OneWayBlock)
                {
                    let linkNotes = $("#linkCustomNote").val().toString();
                    if (mainMap.MarkBlockage(currentEntrance, blockage, linkNotes))
                    {
                        clearSelections();
                        redraw();
                    }
                    $("#defaultBlockage").prop("checked", true);
                }
            }
        });
    }
});