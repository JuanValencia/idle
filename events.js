defaultStats = {
    health: 20,
    hunger: 15,
    memory: 0,
    thirst: 5,
    berries: 0,
    rocks: 0,
    water: 0
}

currentStats = $.extend(true, {}, defaultStats)

totalDefaultStats = {
    memory: 0,
    thirst: 5,
    berries: 0,
    rocks: 0,
    water: 0
}

totalStats = $.extend(true, {}, totalDefaultStats)

msgs = {
    good: (msg)=>{msgs.add(msg, "green")},
    info: (msg)=>{msgs.add(msg, "blue")},
    warn: (msg)=>{msgs.add(msg, "yellow")},
    bad: (msg)=>{msgs.add(msg, "red")},
    add: (msg, color) => {
        $("#messages").prepend($(
            "<div class='"+color+"'><span class='grey'>["+ gameTimeString +"]:</span> "+ msg +"</div>"
        ))
    }
}

function reset() {
    currentStats = $.extend(true, {}, defaultStats)
    totalStats = $.extend(true, {}, totalDefaultStats)
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

getEvents = {
    "berries": { 
        earnMessage: "<b>The world ended!</b> You're so hungry you can't remember anything.",
        getMessage: "You reach for berries... You got {}",
        stateChange: [["hunger", 1]],
        text: "Pick Berries"
    },
    "rocks": { 
        earnMessage: "There's nothing but rocks about.",
        getMessage: "You look for rocks... You got {}",
        stateChange: [["hunger", 2], ["thirst", 1]],
        text: "Gather Rocks"
    },
    "water": {
        earnMessage: "You've got to find some water!  You pick up a jar that might be able to hold some.",
        getMessage: "You search for water... you add {} handful to your jar.",
        stateChange: [["hunger", 1],["thirst", 1]],
        text: "Find Water"
    }
}

doEvents = {
    "eatberry": { 
        doGoodMessage: "<b>Eating a berry!</b> NomNomNom.",
        cantMessage: "<b>Alas!</b> There are no more berries!",
        stateChange: [["berries", -1], ["hunger", -5]]
    },
    "starve": { 
        doBadMessage: "You're so hungry, you stagger.",
        cantMessage: "<b>You die</b> There is no more food!",
        stateChange: [["health", -1]]
    },
    "drinkwater": {
        doGoodMessage: "<b>Drinking...</b> Refreshing!",
        cantMessage: "Need to find some water quick",
        stateChange: [["water", -1],["thirst", -5],["health", 1]]
    },
    "dehydrate": {
        doBadMessage: "Dying of thirst!  You think you see your mother.",
        stateChange: [["health", -3]]
    }
}

triggers = [
    ()=>{ currentStats.hunger >= 20 ? doEvent("starve") : null},
    ()=>{ currentStats.hunger >= 15 ? doEvent("eatberry") : null},
    ()=>{ currentStats.thirst >= 20 ? doEvent("dehydrate") : null},
    ()=>{ currentStats.thirst >= 5 ? doEvent("drinkwater") : null},
    ()=>{ currentStats.health == 0 ? rebirth() : null }
]

oneTimeTriggers =  [
    [false, ()=>{ return addResource("berries")}],
    [false, ()=>{ return totalStats.berries >= 5 ? addResource("rocks") : false }],
    [false, ()=>{ return totalStats.thirst >= 15 ? addResource("water") : false }]
]

function doOneTimeTriggers() {
    oneTimeTriggers.map((oneTimeTrigger)=>{
        if (!oneTimeTrigger[0]) {
            oneTimeTrigger[0] = oneTimeTrigger[1]()
        }
    })
}

function doTriggers() {
    triggers.map((trigger)=>{ trigger() })
}

function addResource(type) {
    btn = $('<div class="resource">' + getEvents[type].text + '</div>');
    btn.append($("<br /><span id='resource-" + type + "' class='center'>" + currentStats[type] + "</span>"));
    btn.click((event)=>{ 
        msgs.info(getEvents[type].getMessage.replace("{}", 1));
        incrementResource(type, 1);
        updateResource(type); 
    })
    $("#resources").append(btn);
    $("#self #stuff").append("<span><div class='ttip'>A " + type + " resource. Try to gain more.</div><i class='" + type + "'></i></span>")
    msgs.warn(getEvents[type].earnMessage);
    return true;
}

function updateResource(type) {
    el = document.getElementById("resource-" + type);
    $(el).html(currentStats[type]) 
}

function incrementResource(type, num) {
    currentStats[type] += num;
    if (num > 0) {
        totalStats[type] += num
    }
    getEvents[type].stateChange.map((change)=>{
        currentStats[change[0]] += change[1]
        updateResource(change[0])
        totalStats[change[0]] != undefined ? totalStats[change[0]] += change[1] : null;
    })
}

function doEvent(type) {
    success = true;
    doEvents[type].stateChange.map((change)=>{
        if(currentStats[change[0]] + change[1] < 0) { success = false }
    })
    if (success) {
        doEvents[type].doGoodMessage ? msgs.good(doEvents[type].doGoodMessage) : msgs.bad(doEvents[type].doBadMessage)
        doEvents[type].stateChange.map((change)=>{
            currentStats[change[0]] += change[1]
            updateResource(change[0])
        })
    }
}

gameTime = 1000000;
gameTimeString = "0:00:00:00"
function doTick() {
    updateGameTime()
    gameTime % 10 == 0 ? doTriggers() : null
    doOneTimeTriggers()
    gameTime % 10 == 0 ? save() : null
    populateStats()
}

function populateStats() {
    Object.keys(currentStats).map((key)=>{
        $("#self i." + key).html(currentStats[key])
    })
    $("#debug").html("<pre>"+JSON.stringify(totalStats, null, 2)+"</pre>")
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
    msgs.info("Game Loading...")
    if (localStorage.getItem("currentStats") == null) {return}
    msgs.good("Welcome back!")
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



