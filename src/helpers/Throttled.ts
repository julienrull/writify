
type ThrottledCallback = (callback: any)=>void;
type ThrottledReturn = (args: any[])=>void;

export default function throttled(callback: ThrottledCallback): ThrottledReturn {
    let requestId: number = -1;
      
    let lastArgs: any;
  
    const later = (context: any) => () => {
      requestId = -1;
      callback.apply(context, lastArgs);
    }
  
    const throttled = function(this: any, ...args: any[]) {
      lastArgs = args;
      if (requestId === -1) {
        requestId = requestAnimationFrame(later(this));
      }
    }
  
    throttled.cancel = () => {
      cancelAnimationFrame(requestId);
      requestId = -1;
    }
  
    return throttled
}