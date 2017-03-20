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