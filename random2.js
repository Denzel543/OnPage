let result = document.getElementById('result');
function getRNDNum() {
    let minNum = parseInt(document.getElementById('min').value);
    let maxNum = parseInt(document.getElementById('max').value);
    let numAmount = parseInt(document.getElementById('amount').value);
    let numCols = parseInt(document.getElementById('cols').value);
    let output = '';
    for (let i = 0; i < numAmount; i++) {
        let randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        output += randomNum;
        if ((i + 1) % numCols !== 0 && i !== numAmount - 1) {
            output += ', ';
        };
        if ((i + 1) % numCols === 0 && i !== numAmount - 1) {
            output += '<br>';
        };
    };
    result.innerHTML = output;
}
;