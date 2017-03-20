class game {
    constructor() {
        this.setupState();
        this.setupResources();
        this.setupSelf(this.state.self);
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
                self: {},
                stats: {}
            }
        }
        this.msgs = new Messages("You're starving!", "The world ended, and all that's left is a berry bush and some rocks...");
    }

    setupResources() {        
        this.resourceButtons = {};
        new ResourceButton(this, "berries", "Pick Berries");
        new ResourceButton(this, "rocks", "Gather Rocks");
    }

    setupSelf(saved) {
        this.self = new Self(this, saved);
        this.state.self = this.self.state;
    }

    updateFooter() {
        $("footer span").html(this.updateTime());
    }

    tick() {
        this.updateFooter();
        this.state.ticks.map((tick)=>{tick ? tick() : null});
        Object.keys(this.state.resources).map(this.showResources.bind(this));
        this.save();
    }

    save() {
        if (this.state.gametime % 5 == 0) {
            localStorage.setItem("state", JSON.stringify(this.state))
        }
        if (this.state.gametime % 100 == 10) {
            console.log(localStorage);
        }
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
        $(el).html(this.state.resources[resource])        
    }

    incrementResource(type, count) {
        this.self.update(type, true);
        if(!this.state.resources[type]) {
            this.state.resources[type] = count;
            this.state.stats[type + "Count"] = count;
        } else {
            this.state.resources[type] += count;
            this.state.stats[type + "Count"] += count;
        }
    }
}

class Self {
    constructor(game, saved) {
        this.game = game;
        this.default = {
            health: 20,
            hunger: 20,
            thirst: 0,
            memory: 0
        }
        this.actions = {
            "berries": { hunger: 1 },
            "rocks": { hunger: 2, thirst: 1 },
            "eatberry": {hunger: -5 },
            "starve": { health: -1 }
        };
        console.log(saved);
        if (saved && saved.hunger) {
            this.state = saved;
        } else {
            this.state = this.default
        }
    }
    update(action, autoupdate) {
        console.log("self did:" + action);
        Object.keys(this.actions[action]).map((key) => {
            this.state[key] += this.actions[action][key];
        });
        if (autoupdate) {
            this.hunger();
        }
        console.log(this.state);
    }
    hunger() {
        if (this.state.hunger >= 20) {
            if (this.game.state.resources.berries && this.game.state.resources.berries > 0) {
                this.update("eatberry", false);
                this.game.state.resources.berries -= 1;
                this.game.msgs.pushMessage("A Berry!", "You scarf it down in one gulp.");
            } else {
                this.game.msgs.pushMessage("Starving!", "Weakness shakes through you.");
                this.update("starve", false)
            }
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
        game.resourceButtons[type] = this;
    }

    click() {
        this.state.game.incrementResource(this.state.type, 1);
    }

    create(type, text) {
        let btn = $('<div class="resource">' + text + '</div>');
        btn.append($("<br /><span id='resource-" + type + "' class='center'>0</span>"));
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