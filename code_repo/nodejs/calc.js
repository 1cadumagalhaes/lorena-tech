function calculateTotalPrice(parc, entrada=0){
    let i = Math.abs(Math.pow(parc*48/20000,0.25)-1);
    return (parc*48/Math.pow(1+i,4))/0.20+entrada;

}
