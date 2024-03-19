const ReportGeneratorInterface = {
    method1: function (){},
    method2: function (param1, param2){},
};

class ReportGenerator{
    method1(){
        console.log("ReportGenerator Method 1 called");
    }
    method2(param1, param2){
        console.log(`ReportGenerator Method 2 called with ${param1} and ${param2}`);
    }
}