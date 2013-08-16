return exports;
};

if(typeof define === 'function'){
	define(['setImmediate'],function(setImmediate){
		return create(setImmediate);
	});
}else if(typeof module === 'undefined' || !('exports' in module)){
	create(typeof setImmediate === 'function'?setImmediate:setTimeout,window);
}else{
	create(process.nextTick,exports);
}
})();
