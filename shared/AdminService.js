const AdminServiceInterface = {
    method1: function (){},
    method2: function (param1, param2){},
};

class AdminService{
    method1(){
        console.log("AdminService Method 1 called");
    }
    method2(param1, param2){
        console.log(`AdminService Method 2 called with ${param1} and ${param2}`);
    }
}