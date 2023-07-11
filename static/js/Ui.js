document.getElementById("send").addEventListener("click", function () {
    net.login()
})
document.getElementById("reset").addEventListener("click", function () {
    net.reset()
})
function check() {
    net.check()
}
setInterval(check, 1000)

