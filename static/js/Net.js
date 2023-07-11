class Net {
    // constructor(){
    //     this.client = io();
    // }

    login() {

        const body = JSON.stringify({ userName: document.getElementById("user").value }) // body czyli przesyłane na serwer dane

        const headers = { "Content-Type": "application/json" } // nagłowek czyli typ danych

        fetch("/user", { method: "post", body, headers }) // fetch
            .then(response => response.json())
            .then(
                data => {
                    if (data == "error1") {
                        document.getElementById("terminal").innerHTML += "<br>Dodano już 2 użytkowników"
                    }
                    else if (data == "error2") {
                        document.getElementById("terminal").innerHTML += "<br>Dodano już użytkownika o takiej nazwie"
                    }
                    else {
                        document.getElementById("window").close()
                        document.getElementById("terminal").innerHTML = "Witaj " + data.userName
                    }
                }
            )

        fetch("/userCount", { method: "post", body, headers }) // fetch
            .then(response => response.json())
            .then(
                data => {
                    if (data == "white") {
                        document.getElementById("terminal").innerHTML += ", grasz białymi"
                    }
                    if (data == "black") {
                        game.black()
                        document.getElementById("terminal").innerHTML += ", grasz czarnymi"
                    }
                }
            )
    }

    check() {

        const body = JSON.stringify({ userName: document.getElementById("user").value }) // body czyli przesyłane na serwer dane

        const headers = { "Content-Type": "application/json" } // nagłowek czyli typ danych

        fetch("/waiting", { method: "post", body, headers }) // fetch
            .then(response => response.json())
            .then(
                data => {
                    if (data == "true") {
                        if (document.getElementById("window").open == false) {
                            document.getElementById("waiting").show()
                        }
                    }
                    else if (data.true == "false") {
                        let player = data.player
                        let playerName = player.slice(13, -2)
                        let terminal = document.getElementById("terminal")
                        document.getElementById("waiting").close()
                        if (terminal.innerHTML != "Witaj " + playerName + ", grasz czarnymi") {
                            game.white()
                            terminal.innerHTML += "<br>Gracz " + playerName + " dolaczyl do gry"
                        }
                    }
                }
            )
    }

    reset() {

        const body = JSON.stringify({ reset: "reset" }) // body czyli przesyłane na serwer dane

        const headers = { "Content-Type": "application/json" } // nagłowek czyli typ danych

        fetch("/user", { method: "post", body, headers }) // fetch
            .then(response => response.json())
            .then(
                data => {
                    document.getElementById("terminal").innerHTML += "<br>Dane o graczach usuniete"
                }
            )

    }

}