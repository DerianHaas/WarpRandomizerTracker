var mainMap = new RegionMap();
$(function () {
    loadWorld().then(function () {
        console.log(mainMap);
    });
    function loadWorld() {
        return fetch("test.json").then(function (response) { return response.json(); }).then(function (data) {
            mainMap.Load(data);
        });
    }
});
//# sourceMappingURL=main.js.map