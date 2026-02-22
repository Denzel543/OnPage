let result = document.getElementById('result');
function generateRND() {
    let minNum = document.getElementById('minNum').value;
    let maxNum = document.getElementById('maxNum').value;
    randomValue = Number(Math.round(Math.random() * maxNum - minNum + 1) - minNum)
    if (randomValue > maxNum) {
        randomValue = Number(Math.round(Math.random() * maxNum - minNum - maxNum / 2))
    }
    if (randomValue < minNum) {
        randomValue = Number(Math.round(Math.random() * maxNum - minNum + minNum * 2)) 
    }
    console.log('From DENZEL.ORG: ' + randomValue)
    result.innerHTML=`
    <center><h2><b>${randomValue}</b></h2><br>Min: ${minNum}, Max: ${maxNum}</center>`
};