const searchIntersection = (arr1, arr2) => {
    tmp = [];
    for(i=0; i<arr2.length; i++){
        let id = arr2[i]._id;
        if(arr1.some(ele => ele._id === id)){
            tmp.push(arr2[i]);
        }
    }
    return tmp;
}

module.exports = searchIntersection;