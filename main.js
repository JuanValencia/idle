class game {
    constructor() {
        this.setupState();
        //this.state.gametime = 0;
        this.resourcesButtons = {};
        this.resourcesButtons["BerryBush"] = new ResourceButton(this, "Berry Bush");
        setInterval(()=>{
            $("footer span").html(this.formatTime())
            let results = this.state.ticks.map((tick)=>{tick ? tick() : null});
            this.save();
            this.show();
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
                resources: {}
            }
        }
        this.msgs = new Messages("You're starving!", "All you can find is a berry bush...");
    }

    save() {
        if (this.state.gametime % 5 == 0) {
            localStorage.setItem("state", JSON.stringify(this.state))
        }
    }

    show() {
        Object.keys(this.state.resources).map(this.showResources);
    }

    showResources(resource) {
        let el = document.getElementById(resource);
        if (el == null) {
            $(".self").append($("<span id='" + resource + "'></span>"));
        }
    }

    registerTick(tick) {
        this.state.ticks.push(tick);
    }

    formatTime() {
        this.state.gametime += 1;
        let secs = this.state.gametime / 5
        let sec = Math.floor(secs % 60);
        let min = Math.floor((secs % 3600) / 60);
        let hour = Math.floor((secs % (3600 * 24)) / 3600);
        let day = Math.floor(secs / (3600 * 24));
        return "" + day + ":" + ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
    }

    addResource(type, count) {
        this.state.resources[type] += count;
    }

    incrementResource(type, count) {
        if(!this.state.resources[type]) {
            this.state.resources[type] = count;
        } else {
            this.state.resources[type] += count;
        }
    }
}

class ResourceButton {
    constructor(game, type) {
        this.state = {
            game: game,
            type: type,
            btn: this.create(type, game.state.resources[type])
        }
    }

    click() {
        this.state.game.incrementResource(this.state.type, 1);
        this.state.btn.html(this.state.type + ':' + this.state.game.state.resources[this.state.type])
    }

    create(type, quantity) {
        if (!quantity) {
            quantity = 0;
        }
        let btn = $('<button type="button" class="btn btn-primary">'
          + type + ':' + quantity +'</button>');
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
        console.log(this.state.msgs);
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