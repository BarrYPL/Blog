const riddle = document.querySelector('#js-riddle');
if (riddle) {
	const input = document.querySelector('input');
	const log = document.getElementById('values');
	const encodedStr1 = 'S1BNR3tlQHN5X2J1dF9zdA=='; //KPMG{e@sy_but_st
	const encodedStr2 = 'TExfdHIwdWJsM3NfcHBsfQ=='; //LL_tr0ubl3s_ppl}
	function Random(seed) {
		value = seed * 503 % 701; //Wynik tego równania dla wartości seed = 570 to: 1;
		return value;
	}
	input.addEventListener('input', updateValue);
	function updateValue(e) {
		var str = e.target.value;
		if (str == atob(encodedStr1).concat(Random(570).toString(), atob(encodedStr2))) {
			log.textContent = 'Flag correct!';
		} else {
			log.textContent = 'Flag incorrect!';
		}
	}
}
