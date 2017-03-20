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

oneTimeTriggers =  {
    "start": [false, ()=>{ return addResource("berries")}],
    "rocks": [false, ()=>{ return totalStats.berries >= 5 ? addResource("rocks") : false }],
    "water": [false, ()=>{ return totalStats.thirst >= 15 ? addResource("water") : false }],
    "fairy": [false, ()=> { return currentStats.berries >= 10 && currentStats.water >= 10 ? addFey("fairy") : false }],
}

function doOneTimeTriggers() {
    Object.keys(oneTimeTriggers).map((key)=>{
        if (!oneTimeTriggers[key][0]) {
            oneTimeTriggers[key][0] = oneTimeTriggers[key][1]()
        }
    })
}

function doTriggers() {
    triggers.map((trigger)=>{ trigger() })
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



