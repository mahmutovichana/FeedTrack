const JWTInterface = {
    method1: function (){},
    method2: function (param1, param2){},
};

class JWT{
    method1(){
        console.log("JWT Method 1 called");
    }
    method2(param1, param2){
        console.log(`JWT Method 2 called with ${param1} and ${param2}`);
    }
}