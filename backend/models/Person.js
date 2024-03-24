abstract: class Person{
    name: STRING;
    constructor(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }
}