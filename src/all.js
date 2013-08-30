		exports.all = function(array) {
			var promise = createDeferred();
			var len = array.length;
			var resolved = 0;
			var out = [];
			var onSuccess = function(n) {
				return function(v) {
					out[n] = v;
					resolved++;
					if (resolved === len) {
						promise.resolve(out);
					}
				};
			};
			array.forEach(function(v, i) {
				v.then(onSuccess(i), function(a) {
					promise.reject(a);
				});
			});
			return promise.promise;
		};