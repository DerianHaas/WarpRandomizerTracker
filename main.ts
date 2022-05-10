const mainMap: RegionMap = new RegionMap();

$(() => {

    loadWorld().then(() => {
        console.log(mainMap);
    });

    function loadWorld() {
        return fetch("test.json").then(response => response.json()).then(data => {
            mainMap.Load(data);
        });
    }
})