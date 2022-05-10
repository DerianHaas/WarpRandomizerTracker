const mainMap: RegionMap = new RegionMap();
let currentHub: number = 0;


$(() => {

    loadWorld().then(() => {
        mainMap.Link(1, 3);
        console.log(mainMap);

        $("#hubSelector").append(mainMap.DrawHubSelector());
        displayCurrentHub();

        $(".hubButton").click(function() {
            currentHub = $(this).data("id");
            displayCurrentHub();
        });
    });

   

    function loadWorld() {
        return fetch("test.json").then(response => response.json()).then(data => {
            mainMap.Load(data);
        });
    }

    function displayCurrentHub() {
        $("#currentHub").empty().append(mainMap.DrawHub(currentHub));
        $("#currentHubImage").empty().append(mainMap.DrawHubImage(currentHub));
    }


})