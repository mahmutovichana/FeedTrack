const AuthorizationInterface = {
    method1: function (){},
    method2: function (param1, param2){},
};

class Authorization{
    method1(){
        console.log("Authorization Method 1 called");
    }
    method2(param1, param2){
        console.log(`Authorization Method 2 called with ${param1} and ${param2}`);
    }
}