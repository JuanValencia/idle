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