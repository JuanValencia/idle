class game {
    constructor() {
        this.setupState();
        this.setupResources();
        setInterval(()=>{
            this.tick();
        }, 200)
    }

    setupState() {
        try {
            this.state = JSON.parse(localStorage.getItem("state"));
        } catch (e) {
            console.log("failed parsing save:")
            console.log(localStorage.getItem("state"));
        }
        if (this.state == null) {
            this.state = {
                gametime: 0,
                ticks:[],
                resources: {},
                stats: {}
            }
        }
        this.msgs = new Messages("You're starving!", "All that's left is a berry bush and some rocks...");
    }

    setupResources() {        
        this.resourcesButtons = [];
        this.resourcesButtons.push(new ResourceButton(this, "berries", "Pick Berries"));
        this.resourcesButtons.push(new ResourceButton(this, "rocks", "Gather Rocks"));
    }

    updateFooter() {
        $("footer span").html(this.updateTime());
    }

    tick() {
        this.updateFooter();
        this.state.ticks.map((tick)=>{tick ? tick() : null});
        this.updateSelf();
        this.save();
    }

    save() {
        if (this.state.gametime % 5 == 0) {
            localStorage.setItem("state", JSON.stringify(this.state))
        }
    }

    updateSelf() {
        Object.keys(this.state.resources).map(this.showResources.bind(this));
    }

    registerTick(tick) {
        this.state.ticks.push(tick);
    }

    updateTime() {
        this.state.gametime += 1;
        let secs = this.state.gametime / 5
        let sec = Math.floor(secs % 60);
        let min = Math.floor((secs % 3600) / 60);
        let hour = Math.floor((secs % (3600 * 24)) / 3600);
        let day = Math.floor(secs / (3600 * 24));
        return "" + day + ":" + ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
    }

    showResources(resource) {
        let el = document.getElementById("resource-" + resource);
        if (el == null) {
            $("#self").append($("<span id='resource-" + resource + "'></span>"));
            el = document.getElementById("resource-" + resource);
        } 
        $(el).html(resource + ":" + this.state.resources[resource])        
    }

    incrementResource(type, count) {
        if(!this.state.resources[type]) {
            this.state.resources[type] = count;
            this.state.stats[type + "Count"] = count;
        } else {
            this.state.resources[type] += count;
            this.state.stats[type + "Count"] += count;
        }
    }
}

class ResourceButton {
    constructor(game, type, text) {
        this.state = {
            game: game,
            type: type,
            text: text,
            btn: this.create(type, text)
        }
    }

    click() {
        this.state.game.incrementResource(this.state.type, 1);
    }

    create(type, text) {
        let btn = $('<div class="resource">' + text + '</div>');
        btn.click((event)=>{this.click()})
        $("#resources").append(btn);
        return btn;
    }

    get() {
        return this.state.btn;
    }
}

class Messages {
    constructor(strong, regular) {
        this.state = {
            msgs:[[strong, regular],["",""],["",""],["",""],["",""]],
            index:0
        }
        this.redraw();
    }
    pushMessage(strong, regular) {
        this.state.index = (this.state.index + 1) % 5
        this.state.msgs[this.state.index] = [strong, regular];
        this.redraw()
    }
    redraw() {
        $("#messages").empty();
        for (let i = 0; i < 5; i++) {
            let newInd = this.state.index - i;
            newInd < 0 ? newInd += 5 : null;
            let curr = this.state.msgs[newInd];
            $("#messages").append($("<div class='msg" + i + "'>" +
                "<strong>" + curr[0] + "</strong> " +
                "<span>" + curr[1] + "</span>" +
            "</div>"));
        }
    }
}

$(document).ready(()=>{
    game = new game();
    $("#reset").click(()=>{
        localStorage.clear();
        location.reload();
    })
});