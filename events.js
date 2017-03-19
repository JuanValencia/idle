defaultStats = {
    health: 20,
    hunger: 20,
    memory: 0,
    thirst: 0,
    berries: 0,
    rocks: 0,
    water: 0
}

currentStats = defaultStats

totalDefaultStats = {
    memory: 0,
    berries: 0,
    rocks: 0,
    water: 0
}

totalStats = totalDefaultStats

msgs = {
    good: (msg)=>{msgs.add(msg, "green")},
    info: (msg)=>{msgs.add(msg, "blue")},
    warn: (msg)=>{msgs.add(msg, "yellow")},
    bad: (msg)=>{msgs.add(msg, "red")},
    add: (msg, color) => {
        $("#messages").prepend($(
            "<div class='"+color+"'>"+ msg +"</div>"
        ))
    }
}

function reset() {
    currentStats = defaultStats
    totalStats = totalDefaultStats
    gameTime = 0
    save()
    location.reload();
}

function rebirth() {
    currentStats = defaultStats
    currentStats.memory = totalStats.memory
}

getEvents = {
    "berries": { 
        earnMessage: "<b>The world ended!</b> You're so hungry you can't remember anything.",
        getMessage: ["You reach for berries... You got {}", "green"],
        stateChange: [["hunger", 1]],
        text: "Pick Berries"
    },
    "rocks": { 
        earnMessage: "There's nothing but rocks about.",
        getMessage: ["You look for rocks... You got {}", "green"],
        stateChange: [["hunger", 2], ["thirst", 1]],
        text: "Gather Rocks"
    },
}

doEvents = {
    "eatberry": { 
        doMessage: ["<b>So hungry!</b> A berry! NomNomNom.", "blue"],
        cantMessage: ["<b>Alas!</b> There are no more berries!","yellow"],
        stateChange: [["hunger", -5]]
    },
    "starve": { 
        doMessage: ["<b>The world ended!</b> You're so hungry you can't remember anything.", "blue"],
        cantMessage: ["<b>You die</b> There is no more food!","red"],
        stateChange: [["heath", -1]]
    },
}

triggers = [
    ()=>{ currentStats.health == 0 ? rebirth() : null },
    ()=>{ currentStats.hunger >= 20 ? doEvent("starve") : null}
]

oneTimeTriggers =  [
    [false, ()=>{ return addResource("berries")}],
    [false, ()=>{ return totalStats.berries >= 5 ? addResource("rocks") : false }]
]

function doOneTimeTriggers() {
    oneTimeTriggers.map((oneTimeTrigger)=>{
        if (!oneTimeTrigger[0]) {
            oneTimeTrigger[0] = oneTimeTrigger[1]()
        }
    })
}

function doTriggers() {

}

function addResource(type) {
    btn = $('<div class="resource">' + getEvents[type].text + '</div>');
    btn.append($("<br /><span id='resource-" + type + "' class='center'>" + currentStats[type] + "</span>"));
    btn.click((event)=>{ 
        incrementResource(type, 1);
        el = document.getElementById("resource-" + type);
        $(el).html(currentStats[type])  
    })
    $("#resources").append(btn);
    msgs.info(getEvents[type].earnMessage);
    return true;
}

function incrementResource(type, num) {
    currentStats[type] += num;
    if (num > 0) {
        totalStats[type] += num
    }
    getEvents[type].stateChange.map((change)=>{
        currentStats[change[0]] += change[1]
    })
}

function doEvent(type) {

}

gameTime = 1000000;
gameTimeString = "0:00:00:00"
function doTick() {
    updateGameTime()
    doOneTimeTriggers()
    doTriggers()
    gameTime % 10 == 0 ? save() : null
    $("#debug").html("<pre>" + JSON.stringify(currentStats, null, 2) + "</pre>")
    $("#debug").append("<pre>" + JSON.stringify(totalStats, null, 2) + "</pre>")
    $("#debug").append("<div>" + gameTimeString + "</div>")
}

function updateGameTime() {
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
}

function load() {
    if (localStorage.getItem("currentStats") == null) {return}
    currentStats = JSON.parse(localStorage.getItem("currentStats"))
    totalStats = JSON.parse(localStorage.getItem("totalStats"))
    gameTime = parseInt(localStorage.getItem("gameTime"))
    updateGameTime();
}

$(document).ready(()=>{
    load();
    setInterval(doTick, 200);
    $("#reset").click(()=>{reset()})
})



