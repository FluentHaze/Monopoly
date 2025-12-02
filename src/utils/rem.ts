// rem 函数
function setRem() {
    const defalutWidth = 750;
    const defalueScale = 1;
    let defalutFontSize = 75;
    const getWidth = window.innerWidth > 750 ? 375 : window.innerWidth;
    let currentScale = getWidth / defalutWidth;
    if (currentScale < 0.85 && getWidth > 750) {
        currentScale = 0.85;
    }

    if (getWidth <= 750) {
        defalutFontSize = defalutFontSize * 2;
    }

    const currentFontSize = (currentScale / defalueScale) * defalutFontSize;
    document.documentElement.style.fontSize = currentFontSize + 'px';
}

setRem();

window.onresize = function () {
    setRem();
};
