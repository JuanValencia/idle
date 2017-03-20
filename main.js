gameTime = 1000000;
gameTimeString = "0:00:00:00"
randomTick = .1234

defaultStats = {
    health: 20,
    hunger: 15,
    memory: 0,
    thirst: 5,
    berries: 0,
    rocks: 0,
    water: 0
}

totalDefaultStats = {
    memory: 0,
    thirst: 5,
    berries: 0,
    rocks: 0,
    water: 0
}

currentStats = $.extend(true, {}, defaultStats)
totalStats = $.extend(true, {}, totalDefaultStats)

function populateStats() {
    Object.keys(currentStats).map((key)=>{
        $("#self i." + key).html(currentStats[key])
    })
    $("#debug").html("<pre>"+JSON.stringify(totalStats, null, 2)+"</pre>")
}

function reset() {
    currentStats = $.extend(true, {}, defaultStats)
    totalStats = $.extend(true, {}, totalDefaultStats)
    Object.keys(oneTimeTriggers).map((key) => {
        oneTimeTriggers[key][0] = false;
    })
    gameTime = 0
    save()
    location.reload();
}

function rebirth() {
    currentStats = $.extend(true, {}, defaultStats)
    currentStats.memory = totalStats.memory
    Object.keys(currentStats).map((key)=>{
        updateResource(key);
    })
    msgs.info("You died!  Your body reassembles itself and you remember your past lives...")
    msgs.warn("All your stuff is gone!")
    msgs.warn("You are really hungry!")
}

function doTick() {
    updateGameTime()
    gameTime % 10 == 0 ? doTriggers() : null
    doOneTimeTriggers()
    gameTime % 10 == 0 ? save() : null
    populateStats()
}

function updateGameTime() {
    randomTick = Math.random()
    gameTime += 2
    seconds = Math.floor(gameTime / 10)
    ss = ("0" + seconds % 60).slice(-2)
    minutes = Math.floor(seconds / 60)
    mm = ("0" + minutes % 60).slice(-2)
    hours = Math.floor(minutes / 60)
    hh = ("0" + hours % 24).slice(-2)
    days = Math.floor(hours / 24)
    gameTimeString = days + ":" + hh + ":" + mm + ":" + ss
}

function save() {
    localStorage.setItem("currentStats", JSON.stringify(currentStats)),
    localStorage.setItem("totalStats", JSON.stringify(totalStats)),
    localStorage.setItem("gameTime", "" + gameTime)
    localStorage.setItem("oneTimeTriggers", 
        JSON.stringify(Object.keys(oneTimeTriggers).map((key)=>{
            return oneTimeTriggers[key][0] ? key : null
        })));
}

function load() {
    msgs.info("Game Loading...")
    if (localStorage.getItem("currentStats") == null) {return}
    msgs.good("Welcome back!")
    currentStats = JSON.parse(localStorage.getItem("currentStats"))
    totalStats = JSON.parse(localStorage.getItem("totalStats"))
    gameTime = parseInt(localStorage.getItem("gameTime"))
    JSON.parse(localStorage.getItem("oneTimeTriggers")).map((key)=>{
        if (key != null) {
            oneTimeTriggers[key][1]();
            oneTimeTriggers[key][0] = true;
        }
    })
    updateGameTime();
}

$(document).ready(()=>{
    load();
    setInterval(doTick, 200);
    $("#reset").click(()=>{reset()})
})