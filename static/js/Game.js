class Game {

    constructor() {
        //czas pozostaly na ruch
        this.time = 30

        //klient obslugujacy sockety
        this.client = io()

        //odbieranie danych
        this.client.on("onconnect", (data) => {
            console.log(data.clientId)
        })

        this.client.on("deletePawn", (data) => {
            console.log(data.pawn)
            this.scene.children.forEach(element => {
                if (element.name == data.pawn) {
                    this.scene.remove(element)
                }
            });
        })

        this.client.on("playerChanged", (data) => {
            // console.log("Zmiena kolejki", data.player)
            console.log("nazwa pionka ", data.name)
            console.log("pozycja pionka ", data.position)
            this.scene.children.forEach(element => {
                if (element.name == data.name) {
                    new TWEEN.Tween(element.position) // co
                        .to({ x: data.position.x, y: data.position.y + 10, z: data.position.z }, 300) // do jakiej pozycji, w jakim czasie
                        .easing(TWEEN.Easing.Quadratic.InOut) // typ easingu (zmiana w czasie)
                        .onComplete(() => {
                            console.log("koniec animacji");
                            element.position.x = data.position.x
                            element.position.y = data.position.y
                            element.position.z = data.position.z
                            this.player = data.player
                        })
                        .start()
                }
            });
        })

        this.client.on("theEnd", (data) => {
            console.log("the end")
            if (data.player != this.color) {
                document.getElementById("win").show()
            }
        })
        //zmienne potrzebne do gry
        this.player = "white"
        this.color

        //podstawowe cechy programu 3d w three js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000);
        this.camera.position.set(1000, 1000, 1000)
        this.camera.lookAt(this.scene.position);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xaaaaaa);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.axes = new THREE.AxesHelper(2000)
        // this.scene.add(this.axes)
        this.raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
        this.mouseVector = new THREE.Vector2() // ten wektor czyli pozycja w przestrzeni 2D na ekranie(x,y) wykorzystany będzie do określenie pozycji myszy na ekranie, a potem przeliczenia na pozycje 3D
        document.getElementById("root").append(this.renderer.domElement);

        this.szachownica = []
        for (let i = 0; i < 8; i++) {
            this.szachownica[i] = []
            for (let j = 0; j < 8; j++) {
                if ((i % 2 == 0) && j % 2 == 0) {
                    this.szachownica[i][j] = 0
                }
                else if ((i % 2 == 1) && j % 2 == 1) {
                    this.szachownica[i][j] = 0
                }
                else {
                    this.szachownica[i][j] = 1
                }
            }
        }
        // console.log(this.szachownica)

        this.geometry = new THREE.BoxGeometry(100, 10, 100);



        //tworzenie szachownicy

        for (let i = 0; i < this.szachownica.length; i++) {
            for (let j = 0; j < this.szachownica[i].length; j++) {
                if (this.szachownica[i][j] == 1) {
                    this.material = new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load('js/mats/woodWhite.jpg'),
                        side: THREE.DoubleSide,
                        wireframe: false,
                        transparent: true,
                        opacity: 1
                    });
                    this.cube = new THREE.Mesh(this.geometry, this.material);
                    this.cube.position.set(i * 100 - 350, 0, j * 100 - 350)
                    this.scene.add(this.cube);
                }
                else {
                    this.material2 = new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load('js/mats/woodGreen.jpg'),
                        side: THREE.DoubleSide,
                        wireframe: false,
                        transparent: true,
                        opacity: 1
                    });
                    this.cube = new THREE.Mesh(this.geometry, this.material2);
                    this.cube.position.set(i * 100 - 350, 0, j * 100 - 350)
                    this.cube.name = "blackTile" + i + j
                    this.scene.add(this.cube);
                }
            }
        }

        this.pionki = []
        for (let i = 0; i < 8; i++) {
            this.pionki[i] = []
            for (let j = 0; j < 8; j++) {
                if ((i == 0) && j % 2 == 0) {
                    this.pionki[i][j] = 2
                }
                else if ((i == 1) && j % 2 == 1) {
                    this.pionki[i][j] = 2
                }
                else if ((i == 6) && j % 2 == 0) {
                    this.pionki[i][j] = 1
                }
                else if ((i == 7) && j % 2 == 1) {
                    this.pionki[i][j] = 1
                }
                else {
                    this.pionki[i][j] = 0
                }
            }
        }
        console.log(this.pionki)

        this.geometryPion = new THREE.CylinderGeometry(50, 50, 20, 32);


        this.render() // wywołanie metody render

    }

    pawns() {
        for (let i = 0; i < this.pionki.length; i++) {
            for (let j = 0; j < this.pionki[i].length; j++) {
                if (this.pionki[i][j] == 1) {
                    this.materialPion = new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load('js/mats/white.jpg'),
                        side: THREE.DoubleSide,
                        wireframe: false,
                        transparent: true,
                        opacity: 1
                    });
                    this.pawn = new THREE.Mesh(this.geometryPion, this.materialPion);
                    this.pawn.position.set(i * 100 - 350, 10, j * 100 - 350)
                    this.pawn.name = "pawnWhite" + i + j
                    this.scene.add(this.pawn);
                }
                else if (this.pionki[i][j] == 2) {
                    this.materialPion2 = new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load('js/mats/wood4.jpg'),
                        side: THREE.DoubleSide,
                        wireframe: false,
                        transparent: true,
                        opacity: 1
                    });
                    this.pawn = new THREE.Mesh(this.geometryPion, this.materialPion2);
                    this.pawn.position.set(i * 100 - 350, 10, j * 100 - 350)
                    this.pawn.name = "pawnBlack" + i + j
                    this.scene.add(this.pawn);
                }
            }
        }
    }
    endGame() {
        game.client.emit("endOfGame", {
            player: game.player
        })
    }
    changePlayer(player, name, position) {
        this.client.emit("changePlayer", {
            player: player,
            name: name,
            position: position
        })
    }
    checkWhite() {
        if (game.player == "white") {
            document.getElementById("waiting2").close()
            document.getElementById("timeForMove").show()
            document.getElementById("time").innerHTML = game.time
            game.time--
            if (game.time < 0) {
                document.getElementById("timeForMove").close()
                document.getElementById("loose").show()
                game.endGame()
                game.player = "none"
            }
        }
        else if (game.player == "black") {
            game.time = 30
            document.getElementById("timeForMove").close()
            document.getElementById("waiting2").show()
        }
        if (document.getElementById("win").open == true) {
            document.getElementById("waiting2").close()
        }
    }
    checkBlack() {
        if (game.player == "black") {
            document.getElementById("waiting2").close()
            document.getElementById("timeForMove").show()
            document.getElementById("time").innerHTML = game.time
            game.time--
            if (game.time < 0) {
                document.getElementById("timeForMove").close()
                document.getElementById("loose").show()
                game.endGame()
                game.player = "none"
            }
        }
        else if (game.player == "white") {
            game.time = 30
            document.getElementById("timeForMove").close()
            document.getElementById("waiting2").show()
        }
        if (document.getElementById("win").open == true) {
            document.getElementById("waiting2").close()
        }
    }

    deletePawn(pawn) {
        this.client.emit("deletePawn", {
            pawn: pawn,
        })
    }

    whiteMove() {
        setInterval(this.checkWhite, 1000)
        let pion
        let tile
        let materialChose = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/white.jpg'),
            color: 0xfefae0,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.9
        });
        let materialPion = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/white.jpg'),
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 1
        });
        let material2 = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/woodGreen.jpg'),
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 1
        });
        let material2Chose = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/woodGreen.jpg'),
            color: 0xfefae0,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.5
        });
        window.addEventListener("mousedown", (e) => {
            if (this.player == "white") {
                this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
                this.raycaster.setFromCamera(this.mouseVector, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children);
                if (intersects.length > 0) {
                    console.log(intersects[0].object.position);
                    if (pion) {
                        if (intersects[0].object.name.slice(0, 9) == "blackTile") {
                            if (intersects[0].object.material == material2Chose) {
                                tile = intersects[0].object
                                let helper = 0
                                if (tile.position.x == pion.position.x - 200) {
                                    if (tile.position.z == pion.position.z - 200) {
                                        this.scene.children.forEach(element => {
                                            if (element.name.slice(0, 9) == "pawnBlack") {
                                                if ((element.position.x == pion.position.x - 100) && (element.position.z == pion.position.z - 100)) {
                                                    this.deletePawn(element.name)
                                                }
                                            }
                                        })
                                    }
                                    if (tile.position.z == pion.position.z + 200) {
                                        this.scene.children.forEach(element => {
                                            if (element.name.slice(0, 9) == "pawnBlack") {
                                                if ((element.position.x == pion.position.x - 100) && (element.position.z == pion.position.z + 100)) {
                                                    this.deletePawn(element.name)
                                                }
                                            }
                                        })
                                    }
                                }
                                pion.material = materialPion
                                this.player = "black"
                                new TWEEN.Tween(pion.position) // co
                                    .to({ x: tile.position.x, y: tile.position.y + 10, z: tile.position.z }, 300) // do jakiej pozycji, w jakim czasie
                                    .easing(TWEEN.Easing.Quadratic.InOut) // typ easingu (zmiana w czasie)
                                    .onComplete(() => {
                                        console.log("koniec animacji");
                                        this.scene.children.forEach(element => {
                                            if (element.name.slice(0, 9) == "blackTile") {
                                                element.material = material2
                                            }
                                        });
                                        this.changePlayer(this.player, pion.name, pion.position)
                                        pion = null
                                    })
                                    .start()
                                // console.log("tile", tile.position)
                                // console.log("pion", pion.position)
                                // pion.position.x = tile.position.x
                                // pion.position.y = tile.position.y+10
                                // pion.position.z = tile.position.z
                                // console.log("siema")
                            }
                        }
                        else {
                            pion.material = materialPion
                            this.scene.children.forEach(element => {
                                if (element.name.slice(0, 9) == "blackTile") {
                                    element.material = material2
                                }
                            });
                            pion = null
                        }
                    }
                    //wybranie pionka i zaznaczenie mozliwych opcji
                    if (intersects[0].object.name.slice(0, 9) == "pawnWhite") {
                        pion = intersects[0].object
                        pion.material = materialChose
                        this.scene.children.forEach(element => {
                            if (element.name.slice(0, 9) == "blackTile") {
                                if (pion.position.x - element.position.x == 100) {
                                    if ((pion.position.z - 100 == element.position.z) || (pion.position.z + 100 == element.position.z)) {
                                        element.material = material2Chose
                                        this.scene.children.forEach(element2 => {
                                            //zablokowanie mozliwosci wejscia na pole na ktorym znajduje sie bialy pionek
                                            if (element2.name.slice(0, 9) == "pawnWhite") {
                                                if (element2.position.x == element.position.x && element2.position.z == element.position.z) {
                                                    element.material = material2
                                                }
                                            }
                                            else if (element2.name.slice(0, 9) == "pawnBlack") {
                                                if (element2.position.x == element.position.x && element2.position.z == element.position.z) {
                                                    element.material = material2
                                                    this.scene.children.forEach(element3 => {
                                                        if (element3.name.slice(0, 9) == "blackTile") {
                                                            if (pion.position.x - element3.position.x == 200) {
                                                                if (pion.position.z - 200 == element3.position.z) {
                                                                    if (pion.position.z - 100 == element2.position.z) {
                                                                        element3.material = material2Chose
                                                                        this.scene.children.forEach(element4 => {
                                                                            //zablokowanie mozliwosci wejscia na pole jesli znajduje sie na nim pionek
                                                                            if (element4.name.slice(0, 9) == "pawnWhite" || element4.name.slice(0, 9) == "pawnBlack") {
                                                                                if (element4.position.x == element3.position.x && element4.position.z == element3.position.z) {
                                                                                    element3.material = material2
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                                if (pion.position.z + 200 == element3.position.z) {
                                                                    if (pion.position.z + 100 == element2.position.z) {
                                                                        element3.material = material2Chose
                                                                        this.scene.children.forEach(element4 => {
                                                                            //zablokowanie mozliwosci wejscia na pole jesli znajduje sie na nim pionek
                                                                            if (element4.name.slice(0, 9) == "pawnWhite" || element4.name.slice(0, 9) == "pawnBlack") {
                                                                                if (element4.position.x == element3.position.x && element4.position.z == element3.position.z) {
                                                                                    element3.material = material2
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
    }

    white() {
        this.color = "white"
        this.camera.position.set(1000, 1200, 0)
        this.camera.lookAt(this.scene.position);
        console.log("grasz bialymi")
        this.pawns()
        this.whiteMove()
    }

    blackMove() {
        setInterval(this.checkBlack, 1000)
        let pion
        let tile
        let materialChose = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/white.jpg'),
            color: 0xe76f51,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.9
        });
        let materialPion2 = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/wood4.jpg'),
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 1
        });
        let material2 = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/woodGreen.jpg'),
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 1
        });
        let material2Chose = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('js/mats/woodGreen.jpg'),
            color: 0xfefae0,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.5
        });
        window.addEventListener("mousedown", (e) => {
            if (this.player == "black") {
                this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
                this.raycaster.setFromCamera(this.mouseVector, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children);
                // console.log(intersects.length)
                if (intersects.length > 0) {
                    console.log(intersects[0].object.position);
                    if (pion) {
                        if (intersects[0].object.name.slice(0, 9) == "blackTile") {
                            if (intersects[0].object.material == material2Chose) {
                                tile = intersects[0].object
                                if (tile.position.x == pion.position.x + 200) {
                                    if (tile.position.z == pion.position.z - 200) {
                                        this.scene.children.forEach(element => {
                                            if (element.name.slice(0, 9) == "pawnWhite") {
                                                if ((element.position.x == pion.position.x + 100) && (element.position.z == pion.position.z - 100)) {
                                                    this.deletePawn(element.name)
                                                }
                                            }
                                        })
                                    }
                                    if (tile.position.z == pion.position.z + 200) {
                                        this.scene.children.forEach(element => {
                                            if (element.name.slice(0, 9) == "pawnWhite") {
                                                if ((element.position.x == pion.position.x + 100) && (element.position.z == pion.position.z + 100)) {
                                                    this.deletePawn(element.name)
                                                }
                                            }
                                        })
                                    }
                                }
                                // console.log("tile", tile.position)
                                // console.log("pion", pion.position)
                                pion.material = materialPion2
                                this.player = "white"
                                new TWEEN.Tween(pion.position) // co
                                    .to({ x: tile.position.x, y: tile.position.y + 10, z: tile.position.z }, 500) // do jakiej pozycji, w jakim czasie
                                    .easing(TWEEN.Easing.Quadratic.InOut) // typ easingu (zmiana w czasie)
                                    .onComplete(() => {
                                        console.log("koniec animacji");
                                        this.scene.children.forEach(element => {
                                            if (element.name.slice(0, 9) == "blackTile") {
                                                element.material = material2
                                            }
                                        });
                                        this.changePlayer(this.player, pion.name, pion.position)
                                        pion = null
                                    })
                                    .start()
                            }
                        }
                        else {
                            pion.material = materialPion2
                            this.scene.children.forEach(element => {
                                if (element.name.slice(0, 9) == "blackTile") {
                                    element.material = material2
                                }
                            });
                            pion = null
                        }
                    }
                    if (intersects[0].object.name.slice(0, 9) == "pawnBlack") {
                        pion = intersects[0].object
                        pion.material = materialChose
                        this.scene.children.forEach(element => {
                            if (element.name.slice(0, 9) == "blackTile") {
                                if (pion.position.x + 100 == element.position.x) {
                                    if ((pion.position.z - 100 == element.position.z) || (pion.position.z + 100 == element.position.z)) {
                                        element.material = material2Chose
                                        this.scene.children.forEach(element2 => {
                                            //zablokowanie mozliwosci wejscia na pole na ktorym znajduje sie bialy pionek
                                            if (element2.name.slice(0, 9) == "pawnBlack") {
                                                if (element2.position.x == element.position.x && element2.position.z == element.position.z) {
                                                    element.material = material2
                                                }
                                            }
                                            else if (element2.name.slice(0, 9) == "pawnWhite") {
                                                if (element2.position.x == element.position.x && element2.position.z == element.position.z) {
                                                    element.material = material2
                                                    this.scene.children.forEach(element3 => {
                                                        if (element3.name.slice(0, 9) == "blackTile") {
                                                            if (pion.position.x + 200 == element3.position.x) {
                                                                if (pion.position.z - 200 == element3.position.z) {
                                                                    if (pion.position.z - 100 == element2.position.z) {
                                                                        element3.material = material2Chose
                                                                        this.scene.children.forEach(element4 => {
                                                                            //zablokowanie mozliwosci wejscia na pole jesli znajduje sie na nim pionek
                                                                            if (element4.name.slice(0, 9) == "pawnWhite" || element4.name.slice(0, 9) == "pawnBlack") {
                                                                                if (element4.position.x == element3.position.x && element4.position.z == element3.position.z) {
                                                                                    element3.material = material2
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                                if (pion.position.z + 200 == element3.position.z) {
                                                                    if (pion.position.z + 100 == element2.position.z) {
                                                                        element3.material = material2Chose
                                                                        this.scene.children.forEach(element4 => {
                                                                            //zablokowanie mozliwosci wejscia na pole jesli znajduje sie na nim pionek
                                                                            if (element4.name.slice(0, 9) == "pawnWhite" || element4.name.slice(0, 9) == "pawnBlack") {
                                                                                if (element4.position.x == element3.position.x && element4.position.z == element3.position.z) {
                                                                                    element3.material = material2
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
    }

    black() {
        this.color = "black"
        this.camera.position.set(-1000, 1200, 0)
        this.camera.lookAt(this.scene.position);
        console.log("grasz czarnymi")
        this.pawns()
        this.blackMove()
    }


    render = () => {
        requestAnimationFrame(this.render);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.render(this.scene, this.camera);
        TWEEN.update();
        // console.log("render leci")
    }
}