import Promise from "../";

interface TestObject {
    value: string;
}

const testObject: TestObject = { value: "value" };

function createPromise(doReject: boolean = false): Promise<TestObject> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (doReject) {
                reject(new Error("reason"));
            } else {
                // resolve should take the appropriately typed object
                resolve(testObject);

                // resolve should also be capable of taking a PromiseLike
                resolve(Promise.resolve(testObject));
            }
        }, 0);
    });
}

const p = createPromise()
    .then(result => console.log(result.value))
    .catch(error => console.log(error))
    .finally(() => console.log("finally"));

Promise.resolve(testObject)
    .then(result => console.log(result.value))
    .catch(error => console.log(error))
    .finally(() => console.log("finally"));

Promise.reject("reason")
    .then(result => console.log(result))
    .catch(error => console.log(error))
    .finally(() => console.log("finally"));

Promise.race([
    {},
    createPromise(),
    Promise.resolve({}),
    Promise.reject("reason")
])
    .then(result => console.log(result))
    .catch(error => console.log(error))
    .finally(() => console.log("finally"));

Promise.all([
    {},
    createPromise(),
    Promise.resolve({}),
    Promise.reject("reason")
])
    .then(results => console.log(results[1].value))
    .catch(error => console.log(error))
    .finally(() => console.log("finally"));

Promise.race([{}, createPromise(), Promise.resolve(), Promise.reject("reason")])
    .then(result => console.log(result))
    .catch(error => console.log(error))
    .finally(() => console.log("finally"));
