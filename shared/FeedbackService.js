const FeedbackServiceInterface = {
    method1: function (){},
    method2: function (param1, param2){},
};

class FeedbackService{
    method1(){
        console.log("FeedbackService Method 1 called");
    }
    method2(param1, param2){
        console.log(`FeedbackService Method 2 called with ${param1} and ${param2}`);
    }
}