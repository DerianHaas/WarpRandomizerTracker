var mainMap = new RegionMap();
var currentHub = 0;
$(function () {
    loadWorld().then(function () {
        mainMap.Link(1, 3);
        console.log(mainMap);
        $("#hubSelector").append(mainMap.DrawHubSelector());
        displayCurrentHub();
        $(".hubButton").click(function () {
            currentHub = $(this).data("id");
            displayCurrentHub();
        });
    });
    function loadWorld() {
        return fetch("test.json").then(function (response) { return response.json(); }).then(function (data) {
            mainMap.Load(data);
        });
    }
    function displayCurrentHub() {
        $("#currentHub").empty().append(mainMap.DrawHub(currentHub));
        $("#currentHubImage").empty().append(mainMap.DrawHubImage(currentHub));
    }
});
//# sourceMappingURL=main.js.map